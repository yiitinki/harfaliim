<template>
  <div class="hello">
    <div>
        <img src="../assets/logo.png" width="90%" height="100%">
    </div>

    <div class="splashBackground" v-show="!ready"></div>
    
    <div class="boxContainer" v-show="!ready">
        <div class="box">
            <p v-show="finish"><b>Toplam Puan:</b>  {{ score }}</p>

            <p v-show="finish"> Efendim derin bir nefes alalım, hazırsanız tekrar deneyelim </p>
            <p v-show="!finish"> Kuralları biliyorsunuz, toplam <b>4</b> dakikamız var efendim. Heyecana hiç gerek yok. Hazırsanız başlıyoruz </p>
            <button class="char" @click="start()"> Hazırım !</button>
        </div>
    </div>

    <div class="scoreboard">
        <div class="totalScore"> <b> Toplam Skor </b> <p>{{ score }}</p></div>
        <div class="futureAward"><b> Soru Puanı </b> <p>{{ (currentWord.length - chars.length) * 100 }}</p></div>
        <div class="time"><b> Kalan Süre</b> <p>0{{ Math.floor(time / 60)}} : {{ (time % 60) || '00' }}</p> </div>
    </div>

    <div class="question" v-show="ready">{{description}}</div>

    <div class="sucess" v-if="(this.answer.join('').toLowerCase() == this.currentWord.toLowerCase()) && this.chars.length != this.answer.length"> Tebrikler! </div>
    <div class="warning" v-if="(this.chars.length == this.answer.length) || (answer.join('').length == currentWord.length) && (answer.join('').toLowerCase() != currentWord.toLowerCase())"> Efendim şöyle bir derin nefes alalım, bir sonraki kelimemiz <b>{{ words[1].length }}</b> harflidir </div>
    <div class="warning" v-if="(chars.length == currentWord.length)"> Opps, let's try with next word! </div>
    <div class="warning" v-if="(answer.join('').length == currentWord.length) && (answer.join('').toLowerCase() != currentWord.toLowerCase())"> Aradığımız kelime bu değil efendim, bi kere daha deneyelim! </div>

    <ul>
        <li v-for="(char,i) of currentWord " :key="i">
            <input :ref="'input'" v-if="chars.indexOf(i) != -1" :value="char" maxlength="1" disabled>
            <input :ref="'input'" v-else v-model="answer[i]" maxlength="1" @keyup="nextChar(i)" disabled>
        </li>
    </ul>

    <div style="display:flex;flex-direction:column;margin:5px;">
        <button class="char" @click="getChar()" v-show="answer.join('').length != currentWord.length"> Harf Aliim </button>

        <button class="next" @click="clearAnswer()" style="display:none"> Cevap Alanını Temizle </button>
        <button class="next" @click="nextWord()"> Sonraki Soru</button>
        <button class="next" @click="reset()"> Baştan Oyna! </button>
    </div>

    <div class="keyboard">
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[0]" :key="i">{{letter.toUpperCase()}}</button>
        </p>
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[1]" :key="i">{{ letter == "i" ? "İ" : letter.toUpperCase()}}</button>
        </p>
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[2]" :key="i">{{letter.toUpperCase()}}</button>
            <button class="letter" @click="deleteLetter()" style="background:#36729A"> SİL </button>
        </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import allWords from './words.json';

export default {
  name: 'Home',
  data() {
      return {
          interval: null,
          ready: 0,
          finish: 0,
          description: '',
          words: allWords,
          currentWord : '',
          chars: [],
          answer: [],
          score: 0,
          time: 0,
          keyboard: [
              ["q","w","e","r","t","y","u","ı","o","p","ğ","ü"],
              ["a","s","d","f","g","h","j","k","l","ş","i"],
              ["z","x","c","v","b","n","m","ö","ç"],
            ]
      }
  },
  async created() {
        this.bringWord();
  },
  methods: {
      start(){
        this.ready = 1;
        this.time = 60 * 4;
        this.score = 0;
        this.countDown();
      },
      reset(){
        this.nextWord();
        this.ready = 0;
        this.time = 60 * 4;
        this.score = 0;
        this.countDownStop();
        this.interval = null;
      },
      bringWord(){
          this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
          this.answer.length = this.currentWord.length;
        this.answer.fill('');

        this.getDescription();
      },

      nextWord(){
        this.countDown();

        if(!this.ifSuccess){
            this.score -= this.currentWord.length * 100; // Reduce Score
        }

        this.clearAnswer();

        this.bringWord();

      },

      getChar(){
        let charNum = this.generateChar();
        while(this.chars.indexOf(charNum) != -1){
            charNum = this.generateChar();
        }
        this.answer[charNum] = this.currentWord[charNum];
        this.chars.push(charNum);
      },

      generateChar(){
          return Math.floor(Math.random() * this.currentWord.length);
      },

      async getDescription(){
        try {
          const res = await axios.get('https://sozluk.gov.tr/gts?ara='+encodeURIComponent(this.currentWord));
          this.description = res.data[0].anlamlarListe[0].anlam;
        } catch(e){
            console.error(e);
        }
      },

      nextChar(id){
          this.$refs.input[(id+1)].focus();
      },

      clearAnswer(){
          this.answer.length = this.currentWord.length;
          this.answer.fill('');
          this.chars= [];
      },

      type(letter){

        this.$set(this.answer, this.focusAnswerBox(), letter)
        
        if(this.ifSuccess){
            this.addScore();
            this.countDownStop();
        }

        
      },

      focusAnswerBox(){
          return this.answer.findIndex(v => v == '');
      },

      deleteLetter(){

        let index = this.focusAnswerBox() != -1 ? this.focusAnswerBox() : this.answer.length;

        while(this.chars.includes(index-1) && index != 0){
            index--;
        }

        this.$set(this.answer, index -1, '')
      },
      countDown(){

        let self = this

        if(!self.interval){
            self.interval = setInterval(function(){

                            self.time = self.time-1;
                            if(self.time == 0){
                                clearInterval(self.interval);
                                self.finish = 1;
                                self.ready = 0;
                                self.interval = null
                            }
            },1000);
        }
        

        
          
      },

      countDownStop(){
            clearInterval(this.interval);
            this.interval = null
      },
      success(){
          if(this.ifSuccess){
              this.addScore();
              return true;
          }
      },

      addScore(){
          this.score += (this.currentWord.length - this.chars.length) * 100;
      }
    },
    
    computed: {
          ifSuccess(){
              return (this.answer.join('').toLowerCase() == this.currentWord.toLowerCase()) && this.chars.length != this.answer.length;
          }
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.hello{
    display: flex;
    flex-direction: column;
    justify-content:space-between;
    height: 90%;
    padding: 5% 0;
}

ul {
    list-style-type: none;
    padding: 0;
}
li {
    border-bottom:1px grey solid; 
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
input{
    margin:0;
    margin-top:5px;
    width:20px;
    font-size:20px;
    text-transform:lowercase;
    color: black;
    text-align: center;
    border: 1px black solid;
}

.char,.next{
    font-size:18px;
    border:1px #36729A solid;
    padding: 10px;
    margin:0 20px;
    text-align: center;
}
.char:hover,.next:hover{
    cursor:pointer
}

.question{
    margin: 0 5px;
    font-size: 20px;
}
.char{
    background:#36729A;
    color:white;
}
.next{
    color:#36729A;
}
.sucess{
    font-size:20px;
    color:green;
}

.warning{
    font-size:20px;
    color:red;
}


.keyboard p{
    display: flex;
    flex-direction: row;
    margin: 5px 0;
}

.letter{
    flex-grow:1;
    width: 100%;
    height: 100%;
    font-size:18px;
    border:1px #36729A solid;
    padding:10px 0;
}

.splashBackground{
    background:white;
    opacity: 0.8;
    position: fixed;
    z-index:100;
    height: 100%;
    width: 100%;
}

.boxContainer {
    z-index: 100;
    height: 100%;
    width: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
}

.boxContainer .box{

    background:#fff;
    border-radius: 5%;
    border:1px solid #f2f2f2;
    padding:5%;

}

.scoreboard{
    margin-top: 5%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    size: 16px;
}


</style>
