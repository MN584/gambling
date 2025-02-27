import { Scene } from 'phaser';

export class Game extends Scene {
    message: any;
    messageBackground: any;

    constructor() {
        super('Game');
    }

    preload() {
      const suits = ['hearts','diamonds','clubs','spades'];
      const values = ['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];
      suits.forEach(suit=>)
 

    }   

    create() {
        

    }

    update() {

    }
}
