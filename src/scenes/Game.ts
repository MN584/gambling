import { Scene } from 'phaser';

const WIDTH = 1000;
const HEIGHT = 700;

type Card = { suit: string, value: string }
type Deck = Card[]
type Point = {x: number, y: number}

export class Game extends Scene {
  message: any;
  messageBackground: any;
  drawPileCards: Phaser.GameObjects.Image[];

  constructor() {
    super('Game');
  }
  //loads all suits and card values
  preload() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    //goes through all suits and ranks to preload all cards
    suits.forEach(suit => {
      values.forEach(value => {
        this.load.image(`${suit}-${value}`, `assets/${suit}-${value}.png`);
      })
    });
    //loads back of card, background, and placeholder
    this.load.image('card_back', 'assets/back.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('placeholder', 'assets/placeholder.png');
  }

  create() {
    //adds and orients the background
    let background = this.add.image(0, 0, 'background');
    background.setOrigin(0, 0);
    background.displayWidth = this.sys.canvas.width;
    background.displayHeight = this.sys.canvas.height;

    //creates a card deck (createDeck), deals cards (dealCards), adds text this.message
    let cardDeck = createDeck();
    dealCards(cardDeck, this);
    this.message = this.add.text(WIDTH / 2, HEIGHT / 2, 'Hello Gambler(victim)!', { fontSize: '50px', color: '#f5f5f5', fontStyle: 'bold', align: 'center' });
    this.message.setOrigin(0.5);
    this.message.setAlpha(0);

    //adds a cool background to text
    this.messageBackground = this.add.graphics();
    this.messageBackground.fillStyle(0xbf0a3a, 1);
    this.messageBackground.setVisible(false);
    this.messageBackground.fillRoundedRect(WIDTH / 2 - this.message.width / 2 - 10, HEIGHT / 2 - this.message.height / 2 - 10, this.message.width + 20, this.message.height + 20, 5);
    this.children.bringToTop(this.message);

    //creates and shuffles deck, makes arrays, goes through each suit and rank and puts it into deck array
    function createDeck() {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
      let deck: Deck = [];
      suits.forEach(suit => {
        values.forEach(value => {
          deck.push({ suit: suit, value: value });
        });
      });
      Phaser.Utils.Array.Shuffle(deck);
      return deck;
    }
    //sets up card layout, creates draw and discard pile, starts card interations
    function dealCards(deck: Deck, scene: Game) {
      const cardWidth = 85;
      const cardHeight = 128;
      const row4Start = { x: 95, y: 300 };
      const rowSpacing = 64;
      const cardSpacing = 5;

      const positions = calculatePositions(row4Start, cardWidth, cardSpacing, rowSpacing);
      //keeps track of cards
      let allCards: Phaser.GameObjects.Image[] = [];
      let discardedCards: Deck = [];

      //makes the piles
      let drawPile = scene.add.image(400, 500, "card_back");
      drawPile.displayWidth = cardWidth;
      drawPile.displayHeight = cardHeight;
      drawPile.setData("type", "drawPile");
      drawPile.setInteractive({ cursor: "pointer" });
      let discardPile = scene.add.image(600, 500, "placeholder");
      discardPile.displayWidth = cardWidth;
      discardPile.displayHeight = cardHeight;
      discardPile.setData("type", "discardPile");

      //deals and places cards            
      for (let i = 0; i < 28; i++) {
        let card = deck.pop();
        if (!card) continue;
        let cardSprite = createCardSprite(scene, card, positions[i], i < 18);
        allCards.push(cardSprite);

        handleCardInteraction(scene, cardSprite, discardPile, allCards, discardedCards);
      }
      //puts cards in draw pile
      scene.drawPileCards = [];
      for (let i = 0; i < deck.length; i++) {
        let card = deck[i];
        let cardSprite = createCardSprite(scene, card, { x: drawPile.x, y: drawPile.y }, true, true);
        scene.drawPileCards.push(cardSprite);
      }
      //handles draw pile behavior
      handleDrawPileClick(scene, drawPile, discardPile, allCards, discardedCards);
    }

    //calculates the exact positions for each card to place them at the start of the game
    function calculatePositions(row4Start: Point, cardWidth: number, cardSpacing: number, rowSpacing: number) {
      return [
        { x: row4Start.x + 1.5 * (cardWidth + cardSpacing), y: row4Start.y - 3 * rowSpacing },
        { x: row4Start.x + 4.5 * (cardWidth + cardSpacing), y: row4Start.y - 3 * rowSpacing },
        { x: row4Start.x + 7.5 * (cardWidth + cardSpacing), y: row4Start.y - 3 * rowSpacing },

        { x: row4Start.x + (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },
        { x: row4Start.x + 2 * (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },
        { x: row4Start.x + 4 * (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },
        { x: row4Start.x + 5 * (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },
        { x: row4Start.x + 7 * (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },
        { x: row4Start.x + 8 * (cardWidth + cardSpacing), y: row4Start.y - 2 * rowSpacing },

        { x: row4Start.x + (cardWidth / 2 + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 1.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 2.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 3.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 4.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 5.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 6.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 7.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },
        { x: row4Start.x + 8.5 * (cardWidth + cardSpacing), y: row4Start.y - rowSpacing },

        { x: row4Start.x, y: row4Start.y },
        { x: row4Start.x + (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 2 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 3 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 4 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 5 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 6 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 7 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 8 * (cardWidth + cardSpacing), y: row4Start.y },
        { x: row4Start.x + 9 * (cardWidth + cardSpacing), y: row4Start.y },
      ];
    }
    //creates and initialized card sprite (face up/down, draw pile)
    function createCardSprite(scene: Phaser.Scene, card: Card, position: Point, isFaceDown: boolean, isFromDrawPile = false) {
      let cardSprite = scene.add.image(position.x, position.y, isFaceDown ? "card_back" : `${card.suit}-${card.value}`);
      //attached card data to sprite, allowing info to be carried and stored
      cardSprite.setData("card", card);
      //if card isnt from the draw pile, its made interactive (clicks, mousovers, cursor)
      if (!isFromDrawPile)
        cardSprite.setInteractive({ cursor: 'pointer' });
      cardSprite.displayWidth = 85;
      cardSprite.displayHeight = 128;
      return cardSprite;
    }

    function handleCardInteraction(scene: Game, cardSprite: Phaser.GameObjects.Image, discardPile: Phaser.GameObjects.Image, allCards, discardedCards) {
      cardSprite.on("pointerdown", function (pointer) {
        let topCardData = discardPile.getData("topCard");
        if (topCardData == undefined)
          return;
        let cardData = cardSprite.getData("card");
        let key = `${cardData.suit}-${cardData.value}`;
        if (isDifferenceOne(topCardData, cardData) && isCardFree(cardSprite, allCards)) {
          scene.children.bringToTop(cardSprite);
          scene.tweens.add({
            targets: cardSprite,
            x: discardPile.x,
            y: discardPile.y,
            duration: 500,
            ease: 'Power2',
            onComplete: function () {
              cardSprite.setTexture(key);
              discardPile.setData("topCard", cardData);
              cardSprite.disableInteractive();
              checkAndFlipFreeCards(allCards);
              discardedCards.push(cardSprite);
              checkForEndGame(scene.drawPileCards, discardedCards, allCards, cardData);
            }
          });
        }
      });
    }

    //checks if card is available to click
    function isCardFree(card, allCards) {
      const cardX = card.x;
      const cardY = card.y;
      const cardWidth = card.displayWidth;
      //goes through allCards array, checks if card is under another carf
      for (let i = 0; i < allCards.length; i++) {
        let otherCard = allCards[i];
        if (otherCard === card) continue;
        if (
          otherCard.y === cardY + 64 &&
          otherCard.x >= cardX - (cardWidth) &&
          otherCard.x <= cardX + (cardWidth)
        ) {
          return false;
        }
      }
      return true;
    }

    //checks if card rank difference is 1
    function isDifferenceOne(card1, card2) {
      const values1 = getCardValue(card1);
      const values2 = getCardValue(card2);
      return values1.some(val1 => values2.some(val2 => Math.abs(val1 - val2) === 1));
    }
    //converts ranks into numerical values
    function getCardValue(card) {
      const valueMap = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'jack': 11,
        'queen': 12,
        'king': 13,
        'ace': 1
      };
      return card.value === 'ace' ? [1, 14] : [valueMap[card.value]];
    }
    //
    function checkAndFlipFreeCards(allCards) {
      for (let i = 0; i < allCards.length; i++) {
        let key = allCards[i].data.list.card.suit + "-" + allCards[i].data.list.card.value;
        if (isCardFree(allCards[i], allCards))
          allCards[i].setTexture(key);
      }
    }

    function handleDrawPileClick(scene, drawPile, discardPile, allCards, discardedCards) {
      drawPile.on("pointerdown", function (pointer) {
        if (scene.drawPileCards.length === 0)
          return;
        let topCard = scene.drawPileCards.pop();
        let cardData = topCard.getData("card");
        let key = `${cardData.suit}-${cardData.value}`;

        let cardSprite = scene.add.image(drawPile.x, drawPile.y, "card_back");
        cardSprite.displayWidth = topCard.displayWidth;
        cardSprite.displayHeight = topCard.displayHeight;
        cardSprite.setData("card", cardData);

        scene.tweens.add({
          targets: cardSprite,
          x: discardPile.x,
          y: discardPile.y,
          duration: 500,
          ease: "Power2",
          onComplete: function () {
            cardSprite.setTexture(key);
            scene.children.bringToTop(cardSprite);
            if (scene.drawPileCards.length === 0) {
              scene.add.image(drawPile.x, drawPile.y, "placeholder");
            }
            discardPile.setData("topCard", cardData);
            checkForEndGame(scene.drawPileCards, discardedCards, allCards, topCard.data.list.card);
          }
        });
      });
    }

    function checkForEndGame(drawPileCards, discardedCards, allCards, topCard) {
      if (drawPileCards.length === 0 && !isThereAnyLegalMove(allCards, topCard, discardedCards)) {
        displayEndMessage("You lost!(womp womp)");
      }
      if (discardedCards.length === 28) {
        displayEndMessage("You won(n!", 0x048738);
      }
    }

    let displayEndMessage = (messageText: string, bgColor = 0xbf0a3a) => {
      this.messageBackground.clear();
      this.messageBackground.fillStyle(bgColor, 1);
      const padding = 10;
      this.messageBackground.fillRoundedRect(
        WIDTH / 2 - this.message.width / 2 - padding,
        HEIGHT / 2 - this.message.height / 2 - padding,
        this.message.width + 2 * padding,
        this.message.height + 2 * padding,
        5
      );
      this.messageBackground.setVisible(true);
      this.message.setText(messageText);
      this.message.setAlpha(1);
    }

    function isThereAnyLegalMove(allCards, topCard, discardedCards) {
      allCards = allCards.filter(item => !discardedCards.includes(item));
      for (let i = 0; i < allCards.length; i++) {
        if (isCardFree(allCards[i], allCards) && isDifferenceOne(allCards[i].data.list.card, topCard)) {
          return true;
        }
      }
      return false;
    }


  } //create end
}
