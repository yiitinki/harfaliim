<template>
  <div class="hello">
    <img src="../assets/logo.png" width="90%" height="100%">
    <div class="question">{{description}}</div>

    <div class="sucess" v-if="answer.join('').toLowerCase() == words[0].toLowerCase()"> Tebrikler! </div>

    <ul>
        <li v-for="(char,i) of words[0]" :key="i">
            <input :ref="'input'" v-if="chars.indexOf(i) != -1" :value="char" maxlength="1">
            <input :ref="'input'" v-else v-model="answer[i]" maxlength="1" @keyup="nextChar(i)" >
        </li>
    </ul>

    <button class="char" @click="getChar()" v-show="answer.join('').length != words[0].length"> Harf Aliim </button>
    <p></p>
    <button class="next" @click="clearAnswer()"> Cevap Alanını Temizle </button>
    <button class="next" @click="nextWord()"> Sonraki Soru</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
      return {
          description: '',
          words: [],
          chars: [],
          answer: []
      }
  },
  async created() {
      this.getWords();
  },
  methods: {
      async getWords() {
        try {
          const res = await axios.get(`https://sozluk.gov.tr/icerik`);
          this.words = res.data.karistirma.map(l => l.dogru);
          this.words = this.words.map(w => w.replace("â","a"))
          this.words = this.words.map(w => w.replace("î","i"))
          this.words = this.words.map(w => w.replace("û","u"))
          this.getDescription();
        } catch(e){
            console.error(e);
        }
      },

      nextWord(){
          this.clearAnswer();
          if(this.words.length != 1){
              this.words.shift();
            this.getDescription();
          }else{
              this.getWords();
          }
      },

      getChar(){
        let charNum = this.generateChar();
        while(this.chars.indexOf(charNum) != -1){
            charNum = this.generateChar();
        }
        this.answer[charNum] = this.words[0][charNum];
        this.chars.push(charNum);
      },

      generateChar(){
          return Math.floor(Math.random() * this.words[0].length);
      },

      async getDescription(){
        try {
          const res = await axios.get('https://sozluk.gov.tr/gts?ara='+encodeURIComponent(this.words[0]));
          this.description = res.data[0].anlamlarListe[0].anlam;
        } catch(e){
            console.error(e);
        }
      },

      nextChar(id){
          this.$refs.input[(id+1)].focus();
      },

      clearAnswer(){
          this.answer = [];
          this.chars= [];
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
    font-size:40px;
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
    border:0;
    margin:0;
    width:20px;
    font-size:20px;
    text-transform:capitalize;
}
button{
    font-size:18px;
    border:1px #36729A solid;
    padding: 10px;
    margin:0 20px;
    text-align: center;
}
button:hover{
    cursor:pointer
}

.question{
    margin: 50px 0;
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
</style>
