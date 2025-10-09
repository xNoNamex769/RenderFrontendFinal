import React from 'react'
import "./styles/ChatComponent.css"


export default function ChatComponent() {
  return (
    <section className='chat-container-home'>
      <a href="#anuncios" className='a-home'>
        <section className='chat-btn-home'>
          <img src="/img/robotica.png" alt="Bot" width={90} />

          <h5 className='chat-title-home h5-home'>ActivBot</h5>
        </section>
      </a>
    </section>
  )
}