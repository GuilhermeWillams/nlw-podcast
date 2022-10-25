import format from 'date-fns/format';
import ptBr from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import styles from './styles.module.scss';

export function Header() {
    const [isChecked, setIsChecked] = useState(false);

    const currentDate= format(new Date(), 'EEEEEE, d MMMM', {
        locale: ptBr,
    });

    return (
        <header className={styles.headerContainer}>
            <img src="/nlw-logo.png" alt="Trilha NLW" />

            <p>Projeto baseado na trilha de ReactJS</p>
            
            <span>{currentDate}</span>
        </header>
    );
}