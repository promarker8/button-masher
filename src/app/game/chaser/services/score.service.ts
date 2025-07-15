import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScoreService {
    private _score = signal(0);
    private _gameOver = signal(false);
    private _topTimes = signal<number[]>(this.getTopTimes());
    private _endGameText = signal<string>('');

    get score() {
        return this._score.asReadonly();
    }

    get gameOver() {
        return this._gameOver.asReadonly();
    }

    get topTimes() {
        return this._topTimes.asReadonly();
    }

    get endGameText() {
        return this._endGameText.asReadonly();
    }

    setEndGameText(text: string) {
        this._endGameText.set(text);
    }
    increment() {
        this._score.update(val => val + 1);
    }

    incrementByAmount(amount: number) {
        this._score.update(val => val + amount);
    }

    reset() {
        this._score.set(0);
        this._gameOver.set(false);
        this._endGameText.set('');
    }

    setGameOver() {
        this._gameOver.set(true);
    }

    getTopScores(): number[] {
        const scores = JSON.parse(localStorage.getItem('topScores') || '[]');
        return scores.sort((a: number, b: number) => b - a).slice(0, 5);
    }

    saveScore(score: number) {
        const scores = this.getTopScores();
        scores.push(score);
        localStorage.setItem('topScores', JSON.stringify(scores));
    }

    saveCompletionTime(seconds: number) {
        const times = this.getTopTimes();
        times.push(seconds);
        localStorage.setItem('topTimes', JSON.stringify(times));
        this._topTimes.set(this.getTopTimes());
    }

    getTopTimes(): number[] {
        const data = localStorage.getItem('topTimes');
        return data ? JSON.parse(data).sort((a: number, b: number) => a - b).slice(0, 5) : [];
    }

    clearLeaderboard() {
        localStorage.removeItem('topTimes');
        this._topTimes.set([]);
        console.log('Leaderboard cleared.');
    }

}