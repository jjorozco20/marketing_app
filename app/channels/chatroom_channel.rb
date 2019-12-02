# frozen_string_literal: true

class ChatroomChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'chatroom_channel'
  end

  def unsubscribed; end
end
