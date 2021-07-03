<template>
  <div class="flex h-screen">
    <div class="bg-pink-800 w-1/5 text-white py-3 px-4">
      <div class="flex justify-between items-center">
        <h1 class="font-semibold text-xl">VueSlackApp</h1>
        <Bell />
      </div>
      <div class="flex items-center">
        <span class="rounded-full w-3 h-3 bg-green-300 mr-2"></span>
        <span class="opacity-50" >{{ user.email }}</span>
      </div>
      <div class="mt-5 flex justify-between items-center">
        <div class="font-bold opacity-50 text-xl">チャンネル</div>
        <Plus />
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="opacity-50 mt-1"
      >
        # {{ channel.name }}
      </div>
      <div class="mt-5 flex justify-between items-center">
        <div class="font-bold opacity-50 text-xl">ダイレクトメッセージ</div>
        <Plus />
      </div>
      <div
        v-for="user in users"
        :key="user.user_id"
        class="mt-2 flex items-center"
      >
        <span class="rounded-full w-3 h-3 bg-green-300 mr-2"></span>
        <span class="opacity-50" @click="directMessage(user)">{{ user.email }}</span>
      </div>
    </div>
    <div class="flex flex-col flex-grow bg-gray-100">
      <header class="border-b bg-white">
        <div class="flex justify-between items-center p-3">
          <div class="font-bold text-lg">{{ channel_name }}</div>
          <div class="flex items-center"> 
            <Call class="mr-1" />
            <Cog class="mr-1" />
            <Info class="mr-1" />
            <div class="flex border w-64 rounded p-1 mx-2">
              <Search />
              <span class="ml-2 text-gray-700">検索</span>
            </div>
            <button class="py-1 px-4 bg-pink-800 text-white rounded" @click="signOut">サインアウト</button>
          </div>
        </div>
      </header>
      <main class="flex-grow overflow-y-scroll">
        <div class="flex flex-col h-full p-4">
          <div class="flex-grow overflow-y-scroll mb-4">
            <div class="mb-4 flex" v-for="message in messages" :key="message.key">
              <Avator :user="message.user" />
              <div class="ml-2">
                <div class="font-bold">{{ message.user }}</div>
                <div>{{ message.content }}</div>
              </div>
            </div>
          </div>
          <div>
            <div class="border border-gray-400">
              <textarea class="w-full p-4 outline-none text-sm" :placeholder="placeholder" v-model="message"></textarea>
              <div class="bg-gray-100 px-2 py-1">
                <button class="py-1 px-2 rounded bg-pink-600 text-white text-sm" @click="sendMessage">送信</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import 'firebase/database';
import Bell from '../components/Bell.vue'
import Plus from '../components/Plus.vue'
import Cog from '../components/Cog.vue'
import Info from '../components/Info.vue'
import Search from '../components/Search.vue'
import Call from '../components/Call.vue'
import Avator from '../components/Avator.vue'

export default {
  components: {
    Bell,
    Plus,
    Search,
    Cog,
    Info,
    Call,
    Avator
  },
  data() {
    return {
      user: "",
      users: [],
      placeholder: "",
      message: "",
      messages: [],
      channel_name: "",
      channel_id: "",
      channels: [
        {
          id: 1,
          name: "営業"
        },
        {
          id: 2,
          name: "マーケティング"
        },
        {
          id: 3,
          name: "クリエイティブ"
        },
        {
          id: 4,
          name: "エンジニア"
        }
      ],
    }
  },
  methods: {
    signOut() {
      firebase.auth().signOut()
      this.$router.push('/signin')
    },
    directMessage(user) {
      this.messages = []
      this.user.uid > user.user_id
        ? (this.channel_id = this.user.uid + "-" + user.user_id)
        : (this.channel_id = user.user_id + "-" + this.user.uid);

      if (this.channel_id != "") {
        firebase.database().ref("messages").child(this.channel_id).off();
      }

      this.channel_name = user.email;
      this.placeholder = user.email + "へのメッセージ";

      firebase.database().ref("messages").child(this.channel_id).on("child_added", snapshot => {
        this.messages.push(snapshot.val())
      })
    },
    sendMessage() {
      const newMessage = firebase.database().ref("messages").child(this.channel_id).push();
      const key_id = newMessage.key;

      newMessage.set({
        key: key_id,
        content: this.message,
        user: this.user.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
      this.message = ""
    }
  },
  mounted() {
    this.user = firebase.auth().currentUser;
    firebase.database().ref("users").on("child_added", snapshot => {
      this.users.push(snapshot.val())
    })
  },
  beforeDestroy() {
    firebase.database().ref("users").off()
    firebase.database().ref("messages").child(this.channel_id).off();
  }
}
</script>
