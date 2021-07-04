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
        <div 
          class="flex justify-center items-center z-10 fixed top-0 left-0 h-full w-full" 
          style="background-color:rgba(0,0,0,0.5)"
          v-show="channelModal"
          @click="closeChannelModal"
        >
          <div class="w-1/3 z-20 rounded-md bg-white text-gray-900 p-4" v-on:click.stop>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-3xl text-black">チャンネル作成</h2>
              <span class="text-4xl cursor-pointer" @click="closeChannelModal">x</span>
            </div>
            <p>チャンネルはチームがコニュニケーションを取る場所です。特定のトピックに基づいてチャンネルを作ると良いでしょう。(例: #マーケティング)</p>
            <div class="my-4">
              <label for="channel-name">名前</label>
              <input type="text" id="channel-name" class="py-2 px-4 w-full rounded border" v-model="channel">
            </div>
            <div class="flex justify-end">
              <button class="px-8 py-2 rounded bg-pink-800 font-bold text-white" @click="addChannel">追加</button>
            </div>
          </div>
        </div>
        <Plus 
          @click.native="showChannelModal"
        />
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="opacity-50 mt-1"
      >
        <span @click="channelMessage(channel)"># {{ channel.channel_name }}</span>
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
      channel: "",
      channelModal: false,
      channel_name: "",
      channel_id: "",
      channels: [],
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
    },
    showChannelModal() {
      this.channelModal = true
    },
    closeChannelModal() {
      this.channelModal = false
    },
    addChannel() {
      const newChannel = firebase.database().ref("channels").push();
      const key_id = newChannel.key

      newChannel.set({
        id: key_id,
        channel_name: this.channel
      }).then(() => {
        this.channelModal = false
      })
      this.channel = ''
    },
    channelMessage(channel) {
      this.messages = [];
      this.channel_name = "# " + channel.channel_name;
      this.placeholder = '# ' + channel.channel_name + 'へのメッセージ';
      this.channel_id = channel.id;

      if (this.channel_id != "") {
        firebase.database().ref("messages").child(this.channel_id).off()
      }

      firebase.database().ref("messages").child(channel.id).on("child_added", snapshot => {
        this.messages.push(snapshot.val());
      });
    }
  },
  mounted() {
    this.user = firebase.auth().currentUser;
    firebase.database().ref("users").on("child_added", snapshot => {
      this.users.push(snapshot.val())
    })

    firebase.database().ref("channels").on("child_added", snapshot => {
      this.channels.push(snapshot.val())
    })
  },
  beforeDestroy() {
    firebase.database().ref("users").off()
    firebase.database().ref("messages").child(this.channel_id).off();
  }
}
</script>
