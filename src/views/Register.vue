<template>
  <div class="flex flex-col h-screen">
    <header class="flex justify-between items-center px-6 py-4 border-b">
      <h1 class="text-xl text-pink-700 font-bold">VueSlackApp</h1>
      <button class="border-pink-700 border-2 rounded px-6 py-2 text-pink-700 hover:bg-pink-700 hover:text-white duration-300"><router-link to="/signin">サインイン</router-link></button>
    </header>
    <div class="bg-gray-100 flex-auto">
      <div class="flex justify-center mt-16">
        <div class="bg-white w-2/5 py-8 px-16 border">
          <h2 class="text-center mb-2 text-3xl">ユーザー登録</h2>
          <p class="text-center mb-8"><span class="font-bold">メールアドレス</span>と<span class="font-bold">パスワード</span>を入力してください</p>
          <form class="w-hull" @submit.prevent="registerUser">
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
            <div v-if="errors.length">
              <ul class="my-4">
                <li
                  v-for="(error, index) in errors"
                  :key="index"
                  class="font-semibold text-red-700"
                >
                  {{ error }}
                </li>
              </ul>
            </div>
            <div class="mb-4">
              <button type="submit" class="border w-full p-3 bg-pink-700 text-white hover:opacity-50 duration-500">ログイン</button>
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
import "firebase/database";

export default {
  data() {
    return {
      email: "",
      password: "",
      errors: []
    }
  },
  methods: {
    registerUser() {
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(response => {
        const user = response.user
        firebase.database().ref("users").child(user.uid).set({
          user_id: user.uid,
          email: user.email
        })
        .then(() => {
          this.$router.push("/")
        })
        .catch(e => {
          console.log(e);
        });
      })
      .catch(e => {
        console.log(e);
        if (e.code == "auth/email-already-in-use") {
          this.errors.push("入力したメールアドレスは登録済みです。");
        } else {
          this.errors.push(
            "入力したメールアドレスかパスワードに問題があります。"
          );
        }
      });
    }
  }
};
</script>