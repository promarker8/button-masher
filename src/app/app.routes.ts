import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { HigherLowerComponent } from './game/higher-lower/higher-lower.component';
import { LandingPageComponent } from './game/landing-page/landing-page.component';
import { ChaserComponent } from './game/chaser/chaser.component';
import { DigipetComponent } from './game/digipet/digipet.component';
import { SpaceInvadersComponent } from './game/space-invaders/space-invaders.component';

export const routes: Routes = [
    {
        path: 'game',
        component: GameComponent,
        children: [
            { path: '', component: LandingPageComponent },
            { path: 'chaser', component: ChaserComponent },
            { path: 'higher-lower', component: HigherLowerComponent },
            { path: 'digipet', component: DigipetComponent },
            { path: 'space-invaders', component: SpaceInvadersComponent }
        ]
    },
    { path: '', redirectTo: 'game', pathMatch: 'full' }
];
