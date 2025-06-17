import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'https://deckofcardsapi.com/api/deck';

  constructor(private http: HttpClient) { }

  newDeck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/new/shuffle/?deck_count=1`);
  }

  drawCard(deckId: string): Observable<any> {
    return this.http.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
  }

  drawCards(deckId: string, count: number): Observable<any> {
    return this.http.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
  }

}
