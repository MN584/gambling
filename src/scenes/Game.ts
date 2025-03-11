import { Scene } from 'phaser';

const WIDTH = 1000;
const HEIGHT = 700;

export class Game extends Scene {
    message: any;
    messageBackground: any;

    constructor() {
        super('Game');
    }
    //loads all suits and card values
    preload() {
      const suits = ['hearts','diamonds','clubs','spades'];
      const values = ['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];
      //goes through all suits and ranks to preload all cards
      suits.forEach(suit=>{
        values.forEach(value=>{
          this.load.image(`${suit}-${value}`,`assets/${suit}-${value}.png`);
        })
      });
      //loads back of card, background, and placeholder
      this.load.image('card_back','assets/back.png');
      this.load.image('background','assets/background.png');
      this.load.image('placeholder','assets/placeholder.png');
    }   

    create() {
      //adds and orients the background
      let background = this.add.image(0,0,'background');
      background.setOrigin(0,0);
      background.displayWidth = this.sys.canvas.width;
      background.displayHeight = this.sys.canvas.height;
      
      //creates a card deck (createDeck), deals cards (dealCards), adds text this.message
      let cardDeck = createDeck();
      dealCards(cardDeck,this);
      this.message = this.add.text(WIDTH/2,HEIGHT/2, 'Hello Gambler(victim)!',{fontSize:'50px',fill:'#f5f5f5',fontStyle:'bold',align:'center'});
      this.message.setOrigin(0.5);
      this.message.setAlpha(0);
      
      //adds a cool background to text
      this.messageBackground = this.add.graphics();
      this.messageBackground.fillStyle(0xbf0a3a,1);
      this.messageBackground.setVisible(false);
      this.messageBackground.fillRoundedRect(WIDTH/2 - this.message.width/2 -10,HEIGHT/2 - this.message.height/2-10,this.message.width+20,this.message.height+20,5);
      this.children.bringToTop(this.message);
    
      //creates and shuffles deck, makes arrays, goes through each suit and rank and puts it into deck array
      function createDeck() {
        const suits = ['hearts','diamonds','clubs','spades'];
        const values = ['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];
        let deck: { suit: string, value: string}[] = [];
        suits.forEach(suit=>{
          values.forEach(value=>{
            deck.push({suit:suit,value:value});
          });
        });
        Phaser.Utils.Array.Shuffle(deck);
        return deck;
      }
        //sets up card layout, creates draw and discard pile, starts card interations
        function dealCards(deck,scene) {
          const cardWidth = 85;
          const cardHeight = 128;
          const row4Start = {x:95,y:300};
          const rowSpacing = 64;
          const cardSpacing = 5;
          
          const positions = calculatePositions(row4Start,cardWidth,cardSpacing,rowSpacing);
        //keeps track of cards
          let allCards = [];
          let discardedCards = [];

          //makes the piles
          let drawPile = scene.add.image(400,500,"card_back");
          drawPile.displayWidth = cardWidth;
          drawPile.displayHeight = cardHeight;
          drawPile.setData("type","drawPile");
          drawPile.setInteractive({cursor: "pointer"});
          let discardPile = scene.add.image(600,500,"placeholder");
          discardPile.displayWidth = cardWidth;
          discardPile.displayHeight = cardHeight;
          discardPile.setData("type","discardPile");
        
          //deals and places cards            
          for(let i=0; i<28; i++) {
            let card = deck.pop();
            let cardSprite = createCardSprite(scene,card,positions[i],i<18);
            allCards.push(cardSprite);
        
            handleCardInteraction(scene,cardSprite,discardPile,allCards,discardedCards);
          }
          //puts cards in draw pile
          scene.drawPileCards = [];
          for(let i=0; i<deck.length;i++) {
            let card = deck[i];
            let cardSprite = createCardSprite(scene,card,{x:drawPile,y:drawPile.y},true,true);
            scene.drawPileCards.push(cardSprite);
          }
          //handles draw pile behavior
          handleDrawPileClick(scene,drawPile,discardPile,allCards,discardedCards);
        }

        //calculates the exact positions for each card to place them at the start of the game
        function calculatePositions(row4Start,cardWidth,cardSpacing,rowSpacing) {
          return [
            {x:row4Start.x+1.5*(cardWidth+cardSpacing),y:row4Start.y-3*rowSpacing},
            {x:row4Start.x+4.5*(cardWidth+cardSpacing),y:row4Start.y-3*rowSpacing},
            {x:row4Start.x+7.5*(cardWidth+cardSpacing),y:row4Start.y-3*rowSpacing},
        
            {x:row4Start.x+(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
            {x:row4Start.x+2*(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
            {x:row4Start.x+4*(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
            {x:row4Start.x+5*(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
            {x:row4Start.x+7*(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
            {x:row4Start.x+8*(cardWidth+cardSpacing),y:row4Start.y-2*rowSpacing},
        
            {x:row4Start.x+(cardWidth/2+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+1.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+2.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+3.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+4.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+5.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+6.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+7.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
            {x:row4Start.x+8.5*(cardWidth+cardSpacing),y:row4Start.y-rowSpacing},
        
            {x:row4Start.x,y:row4Start.y},
            {x:row4Start.x+(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+2*(cardWidth+cardSpacing),y:row4Start.v},
            {x:row4Start.x+3*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+4*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+5*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+6*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+7*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+8*(cardWidth+cardSpacing),y:row4Start.y},
            {x:row4Start.x+9*(cardWidth+cardSpacing),y:row4Start.y},
          ];
        }
        //creates and initialized card sprite (face up/down, draw pile)
        function createCardSprite(scene,card,position,isFaceDown,isFromDrawPile = false) {
          let cardSprite = scene.add.image(position.x,position.y,isFaceDown?"card_back":`${card.suit}-${card.value}`);
          //attached card data to sprite, allowing info to be carried and stored
          cardSprite.setData("card",card);
          //if card isnt from the draw pile, its made interactive (clicks, mousovers, cursor)
          if(!isFromDrawPile)
            cardSprite.setInteractive({cursor:'pointer'});
          cardSprite.displayWidth = 85;
          cardSprite.displayHeight = 128;
          return cardSprite;
        }

        function handleCardInteraction(scene,cardSprite,discardPile,allCards,discardedCards){
          cardSprite.on("pointerdown",function(pointer){
            let topCardData = discardPile.getData("topCard");
            if(topCardData == undefined)
              return;
            let cardData = cardSprite.getData("card");
            let key = `${cardData.suit}-${cardData.value}`;
            if(isDifferenceOne(topCardData,cardData) && isCardFree(cardSprite,allCards)) {
              scene.children.bringToTop(cardSprite);
              scene.tweens.add({
                targets: cardSprite,
                x: discardPile.x,
                y:discardPile.y,
                duration:500,
                ease: 'Power2',
                onComplete: function() {
                  cardSprite.setTexture(key);
                  discardPile.setData("topCard",cardData);
                  cardSprite.disableInteractive();
                  checkAndFlipFreeCards(allCards);
                  discardedCards.push(cardSprite);
                  checkForEndGame(scene.drawPileCards,discardedCards,allCards,cardData);
                }
              });
            }
          });
        }
        
    
    }//create end
}
