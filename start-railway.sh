#!/bin/bash

# AI service ni background da ishga tushirish
cd ai-service
python main.py &
AI_PID=$!
cd ..

# Bot ni ishga tushirish
npm start

# Cleanup
kill $AI_PID 2>/dev/null
