<template>
  <div class="flex flex-col h-screen">
    <header class="flex justify-between items-center px-6 py-4 border-b">
      <h1 class="text-xl text-pink-700 font-bold">VueSlackApp</h1>
      <button class="border-pink-700 border-2 rounded px-6 py-2 text-pink-700 hover:bg-pink-700 hover:text-white duration-300"><router-link to="/signin">Slackを始める</router-link></button>
    </header>
    <div class="bg-gray-100 flex-auto">
      <div class="flex justify-center mt-16">
        <div class="bg-white w-2/5 py-8 px-16 border">
          <h2 class="text-center mb-2 text-3xl">サインイン</h2>
          <p class="text-center mb-8"><span class="font-bold">メールアドレス</span>と<span class="font-bold">パスワード</span>を入力してください</p>
          <form class="w-hull" @submit.prevent="signIn">
            <div class="mb-2">
              <input 
                type="email" 
                id="email"
                class="border w-full p-3"
                v-model="email"
                placeholder="メールアドレス"
              >
            </div>
            <div class="mb-4">
              <input 
                type="password" 
                id="password"
                class="border w-full p-3"
                v-model="password"
                placeholder="パスワード"
              >
            </div>
            <div class="mb-4">
              <button type="submit" class="border w-full p-3 bg-pink-700 text-white hover:opacity-50 duration-500">サインイン</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: ""
    }
  },
  methods: {
    signIn() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(response => {
        console.log(response)
        this.$router.push("/")
      })
      .catch(e => {
        console.log(e);
      });
    }
  }
};
</script>