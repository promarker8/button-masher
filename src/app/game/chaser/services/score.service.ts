import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScoreService {
    private _score = signal(0);
    private _gameOver = signal(false);

    get score() {
        return this._score.asReadonly();
    }

    get gameOver() {
        return this._gameOver.asReadonly();
    }

    increment() {
        this._score.update(val => val + 1);
    }

    reset() {
        this._score.set(0);
        this._gameOver.set(false);
    }

    setGameOver() {
        this._gameOver.set(true);
    }
}