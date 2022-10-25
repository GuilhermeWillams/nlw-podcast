import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { ImVolumeMute, ImVolumeMute2, ImVolumeLow, ImVolumeMedium, ImVolumeHigh } from 'react-icons/im'
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { converDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(100);
    const [volumeRef, setVolumeRef] = useState(100);
    const [mute, setMute] = useState(false);
    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        clearPlayerState,
        hasNext,
        hasPrevious
    } = usePlayer();

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play();
        }else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setupProgressListener() {
         audioRef.current.currentTime = 0;
         audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
         });
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    function volumeChange(amount: number) {
        audioRef.current.volume = amount / 100;
        setVolume(amount);
        if (amount > 10){
            setVolumeRef(amount);
        }else if (amount == 0) {
            setMute(!mute);
        }
    }

    function toggleMute (mute: boolean) {
        setMute(!mute);
        if (mute) {
            setVolume(0);
            audioRef.current.volume = 0;
        } else {
            setVolume(volumeRef);
            audioRef.current.volume = volumeRef / 100;
        }
    }

    function changeIcon(volume: number) {
        if (volume <= 100 && volume > 66) {
            return <ImVolumeHigh />
        }else if (volume <= 66 && volume > 33) {
            return <ImVolumeMedium />
        }else if (volume <= 33 && volume > 0) {
            return <ImVolumeLow/>
        }else {
            return <ImVolumeMute2 />
        }
     
    }

    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playerIcon.png" alt="Tocando agora" />
                <strong>Tocando agora </strong>
            </header>
            {
            episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592} 
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : 
            (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um áudio para ouvir</strong>
                </div>
            )
            }


            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>

                    <span>{converDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>
                        {
                        episode ? 
                        (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff'}}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
                            />
                        ) : 
                        (
                            <div className={styles.emptySlider} />
                        )
                    }
                    </div>
                    
                    <span>{converDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>
                { episode && (
                    <audio 
                    src={episode.url}
                    ref={audioRef}
                    autoPlay
                    loop={isLooping}
                    onEnded={handleEpisodeEnded}
                    onPlay={() => setPlayingState(true)}
                    onPause={() => setPlayingState(false)}
                    onLoadedMetadata = {setupProgressListener}
                    />
                ) }
                <div className={styles.buttons}>

                    <button type="button" disabled={!episode || episodeList.length == 1} onClick={toggleShuffle} className={isShuffling ? styles.isActive : '' }>
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>

                    <button type="button" disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" onClick={playPrevious}/>
                    </button>

                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        { isPlaying ? <img src="/pause.svg" alt="Tocar" /> : <img src="/play.svg" alt="Tocar" />}
                    </button>

                    <button type="button" disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" onClick={playNext}/>
                    </button>

                    <button type="button" disabled={!episode } onClick={toggleLoop} className={isLooping ? styles.isActive : '' }>
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>

                </div>

                <div className={styles.volumeProgress}> 
                    <button onClick={() => toggleMute(mute)} disabled={ !episode } >
                        <span>
                        {
                            episode ?
                                (
                                    changeIcon(volume)
                                ) :
                                (
                                    <ImVolumeMute />
                                )
                        }
                        </span>
                    </button>
                    <div className={styles.volumeSlider}>
                            {
                            episode ? 
                            (
                                <Slider
                                    max={100}
                                    value={volume}
                                    onChange={volumeChange}
                                    trackStyle={{ backgroundColor: '#04d361'}}
                                    railStyle={{ backgroundColor: '#9f75ff'}}
                                    handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
                                />    
                            ) : 
                            (
                                <div className={styles.emptyVolumeSlider} />
                            )
                        }
                    </div>
                    
                </div>
            </footer>

        </div>
    );
}