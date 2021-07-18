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
              <Delete 
                class="text-4xl cursor-pointer" 
                @click.native="closeChannelModal"
              />
            </div>
            <p>チャンネルはチームがコニュニケーションを取る場所です。特定のトピックに基づいてチャンネルを作ると良いでしょう。(例: #マーケティング)</p>
            <div class="my-4">
              <label for="channel-name">名前</label>
              <input type="text" id="channel-name" class="py-2 px-4 w-full rounded border" v-model="channel">
            </div>
            <div class="flex justify-end">
              <button class="px-8 py-2 rounded bg-pink-800 font-bold text-white" @click="addChannel" :class="disabledAddChannel">追加</button>
            </div>
          </div>
        </div>
        <Plus 
          @click.native="showChannelModal"
          class="cursor-pointer"
        />
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="opacity-50 mt-1 channel-message rounded hover:bg-pink-700 cursor-pointer"
        :ref="channel.id"
      >
        <span @click="channelMessage(channel)"># {{ channel.channel_name }}</span>
      </div>
      <div class="mt-5">
        <div class="font-bold opacity-50 text-xl">ダイレクトメッセージ</div>
      </div>
      <div
        v-for="user in users"
        :key="user.user_id"
        class="mt-2 flex items-center direct-message rounded opacity-50 hover:bg-pink-700 cursor-pointer"
        :ref="user.user_id"
      >
        <span class="rounded-full w-3 h-3 mr-2" :class="[isOnline(user) ? 'bg-green-300' : 'bg-gray-600']"></span>
        <span @click="directMessage(user)">{{ user.email }}</span>
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
            <button class="py-1 px-4 bg-pink-800 text-white rounded hover:bg-pink-600 duration-700" @click="signOut">サインアウト</button>
          </div>
        </div>
      </header>
      <main 
        class="flex-grow overflow-y-scroll relative" 
        @dragenter="dragEnter" 
        @dragleave="dragLeave"
        @drop.prevent="dropFile"
        @dragover.prevent
      >
        <div 
          class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-10" 
          v-show="fileOverlay" 
          style="pointer-events: none"
        >
          <p class="text-4xl font-bold">ファイルをアップロード</p>
        </div>
        <div class="z-10 fixed top-0 left-0 h-full w-full flex items-center justify-center" style="background-color:rgba(0,0,0,0.5)" v-show="fileModal" @click="closeFileModal">
          <div class="bg-white rounded-md text-gray-900 w-1/3 p-4" @click.stop >
            <div class="w-full h-2">
              <div class="bg-pink-900 h-full block" style="width: 0%" ref="progress_bar"></div>
            </div>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl leading-loose text-black">ファイルをアップロード</h2>
              <Delete 
                class="text-2xl" 
                @click.native="closeFileModal"
              />
            </div>
            <div class="my-3">
              <textarea class="rounded w-full border-gray-400 p-3 border" placeholder="ファイルに関するメッセージの追加" v-model="fileMessage"></textarea>
            </div>
            <div class="bg-gray-200 p-3 border border-gray-400 rounded mb-4">
              <div class="bg-white p-3">
                <span class="font-bold text-xl" v-text="file.name"></span>
              </div>
            </div>
            <div class="flex justify-end items-center">
              <button class="px-8 py-2 rounded bg-pink-800 font-bold text-white" @click="fileUpload" :class="disabledFileMessage">アップロード</button>
            </div>
          </div>
        </div>
        <div class="h-full" v-if="initDisplay">
          <div class="h-full">
            <div class="text-center pt-16">
              <img class="inline-block w-2/5 pb-8" src="../assets/hello.png" alt="home">
              <p class="leading-loose">このツールはチームで円滑にコミュニケーションを図るためのコミュニケーションツールです。<br>特定のトピックに基づいてチャンネルを作成し会話を始めてみましょう。</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col h-full p-4" v-else>
          <div class="flex-grow overflow-y-scroll mb-4" id="message_bottom">
            <div class="mb-4 flex hover:bg-gray-200" v-for="message in messages" :key="message.key">
              <Avator :user="message.user" />
              <div class="ml-2 flex-grow">
                <div class="font-bold">{{ message.user }}</div>
                <div>{{ message.content }}</div>
                <div v-if="message.url">
                  <img :src="message.url" width="360px" />
                </div>
              </div>
              <Edit
                class="cursor-pointer bg-gray-300 rounded leading-8 h-8 w-8 px-2 opacity-25 hover:opacity-100"
                @click.native="showEditModal(message)"
                v-if="messageBtnShow(message.user_id)" 
              />
              <Delete
                class="cursor-pointer bg-gray-300 rounded leading-8 h-8 w-8 px-2 opacity-25 hover:opacity-100"
                @click.native="deleteMessage(message.key)"
                v-if="messageBtnShow(message.user_id)" 
              />
            </div>
          </div>
          <div>
            <div class="border border-gray-400">
              <textarea class="w-full p-4 outline-none text-sm" :placeholder="placeholder" v-model="message"></textarea>
              <div class="bg-gray-100 px-2 py-1">
                <button class="py-1 px-2 rounded bg-pink-600 text-white text-sm" @click="sendMessage" :class="disabledMessage">送信</button>
              </div>
            </div>
          </div>
          <div 
            class="flex justify-center items-center z-10 fixed top-0 left-0 h-full w-full" 
            style="background-color:rgba(0,0,0,0.5)"
            v-show="editModal"
            @click="closeEditModal"
          >
            <div class="w-1/3 z-20 rounded-md bg-white text-gray-900 p-4" v-on:click.stop>
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-3xl text-black">メッセージの編集</h2>
                <Delete 
                  class="text-4xl cursor-pointer" 
                  @click.native="closeEditModal"
                />
              </div>
              <div class="my-4">
                <label for="edit-message">テキスト内容</label>
                <textarea type="text" id="edit-message" class="py-2 px-4 w-full rounded border" v-model="form.content"></textarea>
              </div>
              <div class="flex justify-end">
                <button class="px-8 py-2 rounded bg-pink-800 font-bold text-white" @click="updateMessage(form.key)">更新</button>
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
import "firebase/storage";
import Bell from '../components/Bell.vue'
import Plus from '../components/Plus.vue'
import Cog from '../components/Cog.vue'
import Info from '../components/Info.vue'
import Search from '../components/Search.vue'
import Call from '../components/Call.vue'
import Avator from '../components/Avator.vue'
import Delete from '../components/Delete.vue'
import Edit from '../components/Edit.vue'

export default {
  components: {
    Bell,
    Plus,
    Search,
    Cog,
    Info,
    Call,
    Avator,
    Delete,
    Edit
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
      connection_key: '',
      connections: [],
      fileOverlay: false,
      fileModal: false,
      fileMessage: "",
      file: "",
      url: "",
      editModal: false,
      form: {}
    }
  },
  computed: {
    disabledMessage() {
      return this.message.length > 0 ? '' : 'disabled-message'
    },
    disabledFileMessage() {
      return this.fileMessage.length > 0 ? '' : 'disabled-message'
    },
    disabledAddChannel() {
      return this.channel.length > 0 ? '' : 'disabled-message'
    },
    initDisplay() {
      return this.channel_name === '' && this.placeholder === ''
    }
  },
  methods: {
    signOut() {
      if (confirm("サインアウトしますか？")) {
        firebase.database().ref("connections").child(this.connection_key).remove();
        firebase.auth().signOut()
        this.$router.push('/signin')
      }
    },
    directMessage(user) {

      let targetUser = user.user_id
      this.channelMessageActive()
      this.directMessageActive()

      let ref = this.$refs[targetUser][0]
      ref.style.backgroundColor = '#BE185D'

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
        this.$nextTick(() => {
          let message_bottom = document.getElementById("message_bottom");
          message_bottom.scrollTop = message_bottom.scrollHeight;
        });
      })
    },
    sendMessage() {
      const newMessage = firebase.database().ref("messages").child(this.channel_id).push();
      const key_id = newMessage.key;

      let content = ""

      if (this.url == "") {
        content = this.message;
      } else {
        content = this.fileMessage;
      }

      newMessage.set({
        user_id: this.user.uid,
        key: key_id,
        content: content,
        user: this.user.email,
        url: this.url,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
      this.url == "" ? this.message = "" : this.fileMessage = "";
      this.url = "";
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

      let targetChannel = channel.id
      this.channelMessageActive()
      this.directMessageActive()

      let ref = this.$refs[targetChannel][0]
      ref.style.backgroundColor = '#BE185D'

      this.messages = [];
      this.channel_name = "# " + channel.channel_name;
      this.placeholder = '# ' + channel.channel_name + 'へのメッセージ';
      this.channel_id = channel.id;

      if (this.channel_id != "") {
        firebase.database().ref("messages").child(this.channel_id).off()
      }

      firebase.database().ref("messages").child(this.channel_id).on("child_added", snapshot => {
        this.messages.push(snapshot.val());
        this.$nextTick(() => {
          let message_bottom = document.getElementById("message_bottom");
          message_bottom.scrollTop = message_bottom.scrollHeight;
        });
      });
    },
    isOnline(user) {
      if (user.status === "online") {
        return true;
      } else {
        return false;
      }
    },
    fileUpload() {
      const storageRef = firebase.storage().ref("images/" + this.file.name)
      const uploadTask = storageRef.put(this.file);
      
      uploadTask.on(
        "state_changed",
        snapshot => {
          let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.$refs.progress_bar.style.width = percentage + "%";
        },
        error => {
          console.log(error);
        },
        () => {
          storageRef.getDownloadURL().then(url => {
            this.url = url;
            this.sendMessage();
            this.fileModal = false;
          });
        }
      );
    },
    dragEnter() {
      this.fileOverlay = true
    },
    dragLeave() {
      this.fileOverlay = false
    },
    dropFile(event) {
      this.file = event.dataTransfer.files[0]
      this.fileModal = true
      this.fileOverlay = false
    },
    closeFileModal() {
      this.fileModal = false
    },
    directMessageActive() {
      let directMessage = document.querySelectorAll('.direct-message');
      directMessage.forEach(function(dm) {
        dm.style.backgroundColor = "transparent"
      })
    },
    channelMessageActive() {
      let channelMessage = document.querySelectorAll('.channel-message');
      channelMessage.forEach(function(cm) {
        cm.style.backgroundColor = "transparent"
      })
    },
    messageBtnShow(userId) {
      return this.user.uid === userId
    },
    deleteMessage(key) {
      if (confirm("削除しますか？")) {
        firebase.database().ref("messages").child(this.channel_id).child(key).remove()
      }
      this.messages = []

      if (this.channel_id != "") {
        firebase.database().ref("messages").child(this.channel_id).off()
      }

      firebase
      .database()
      .ref("messages")
      .child(this.channel_id)
      .on("child_added", snapshot => {
        this.messages.push(snapshot.val());
        this.$nextTick(() => {
          let message_bottom = document.getElementById("message_bottom");
          message_bottom.scrollTop = message_bottom.scrollHeight;
        });
      });
    },
    showEditModal(message) {
      Object.assign(this.form, message)
      this.editModal = true
    },
    closeEditModal() {
      this.editModal = false
    },
    updateMessage(key) {
      if (this.form.content.length > 0) {
        firebase.database().ref('messages').child(this.channel_id).child(key).update(this.form);
      } else {
        confirm("テキストが入力されていません")
      }
      this.form = {}
      this.editModal = false
      this.messages = []
      
      if (this.channel_id != "") {
        firebase.database().ref("messages").child(this.channel_id).off()
      }

      firebase
      .database()
      .ref("messages")
      .child(this.channel_id)
      .on("child_added", snapshot => {
        this.messages.push(snapshot.val());
        this.$nextTick(() => {
          let message_bottom = document.getElementById("message_bottom");
          message_bottom.scrollTop = message_bottom.scrollHeight;
        });
      });
    },
  },
  mounted() {
    this.user = firebase.auth().currentUser;
    firebase.database().ref("users").on("child_added", snapshot => {
      let user = snapshot.val();

      if (this.user.uid == user.user_id) {
        user.status = "online";
      } else {
        user.status = "offline";
      }
      this.users.push(user);
    })

    firebase.database().ref("channels").on("child_added", snapshot => {
      this.channels.push(snapshot.val())
    }),

    firebase.database().ref(".info/connected").on("value", snapshot => {
      if ( snapshot.val() === true ) {
        let connectionRef = firebase.database().ref("connections").push();
        this.connection_key = connectionRef.key
        connectionRef.onDisconnect().remove();

        connectionRef.set({
          user_id: this.user.uid,
          key: this.connection_key
        });
      }
    }),

    firebase.database().ref("connections").on("child_added", snapshot => {
      let new_connection = snapshot.val();
      this.connections.push(new_connection);

      let user = this.users.find(
        user => user.user_id === new_connection.user_id
      );

      if (user != undefined) {
        user.status !== "online";
      }
    }),

    firebase.database().ref("connections").on("child_removed", snapshot => {
      let remove_connection = snapshot.val();

      this.connections = this.connections.filter(
        connection => connection.key !== remove_connection.key
      );

      let index = this.connections.findIndex(connection => {
        return connection.user_id === remove_connection.user_id;
      });

      if (index === -1) {
        let user = this.users.find(
          user => user.user_id == remove_connection.user_id
        );
        user.status = "offline";
      }
    })
  },
  beforeDestroy() {
    firebase.database().ref("users").off()
    firebase.database().ref("messages").child(this.channel_id).off();
    firebase.database().ref(".info/connected").off();
  }
}
</script>

<style scoped>
.disabled-message {
  opacity: .3;
  pointer-events: none;
}
</style>