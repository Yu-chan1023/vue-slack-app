<template>
  <div>
    <h1>VueSlackApp</h1>
    <p>ログイン</p>
    <button type="submit" @click="signOut">サインアウト</button>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";

export default {
  methods: {
    signOut() {
      firebase.auth().signOut()
      this.$router.push('/signin')
    }
  }
}
</script>
