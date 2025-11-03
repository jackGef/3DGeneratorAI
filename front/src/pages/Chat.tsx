import React from 'react'
import '../pages-css/chat.css'
import TextInput from '../components/TextInput'


const Chat = () => {
  return (
    <div>
      <div className='master-container'>
        <nav>side bar</nav>
        <div className='chat-container'>chat's response area</div>
        <div>
          <TextInput className='text-box-shadow' color='gray' margin='0 auto' height='38px' width='400px' border="black" borderRadius='40px'/>
        </div>
      </div>
    </div>
  )
}

export default Chat
