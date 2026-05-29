#!/bin/bash

# AI service ni background da ishga tushirish
echo "Starting AI service..."
cd ai-service
python main.py &
AI_PID=$!
echo "AI service started with PID: $AI_PID"
cd ..

# AI service tayyor bo'lishini kutish
echo "Waiting for AI service to be ready..."
sleep 5

# Bot ni ishga tushirish
echo "Starting bot..."
npm start

# Cleanup
kill $AI_PID 2>/dev/null
