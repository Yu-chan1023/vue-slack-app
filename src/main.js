import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from "firebase/app";
import "./assets/css/tailwind.css" 
import "./assets/css/styles.css"

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyC0t_Y1WlFfRP0iP4ivC_LaXi9BI1KuPy8",
  authDomain: "vue-slack-app-bc696.firebaseapp.com",
  databaseURL: "https://vue-slack-app-bc696-default-rtdb.firebaseio.com",
  projectId: "vue-slack-app-bc696",
  storageBucket: "vue-slack-app-bc696.appspot.com",
  messagingSenderId: "643244942305",
  appId: "1:643244942305:web:2650376be07e01da9528a0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.firebase = firebase;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
