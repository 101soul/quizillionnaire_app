import React, { useState, useEffect, useRef } from 'react'
    import styled from 'styled-components'
    import QuizForm from './components/QuizForm'
    import VideoPreview from './components/VideoPreview'
    import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
    import html2canvas from 'html2canvas'
    
    const Container = styled.div\`
      display: flex;
      gap: 2rem;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      
      @media (max-width: 1024px) {
        flex-direction: column;
        align-items: center;
      }
    \`
    
    const PreviewSection = styled.div\`
      display: flex;
      flex-direction: column;
      align-items: center;
    \`
    
    const Button = styled.button\`
      padding: 0.5rem 1rem;
      margin-top: 1rem;
      background: \${({ theme }) => theme.colors.primary};
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Copperplate Gothic Bold', sans-serif;
      font-size: 18px;
      min-width: 120px;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &:not(:disabled):hover {
        opacity: 0.9;
      }
    \`
    
    const STATES = {
      IDLE: 'IDLE',
      READY: 'READY',
      SET: 'SET',
      GO: 'GO',
      QUESTION: 'QUESTION',
      ANSWER: 'ANSWER',
      OUTRO: 'OUTRO'
    }
    
    const App = () => {
      const [quizData, setQuizData] = useState(null)
      const [gameState, setGameState] = useState(STATES.IDLE)
      const [currentQuestion, setCurrentQuestion] = useState(-1)
      const [showAnswer, setShowAnswer] = useState(false)
      const [timer, setTimer] = useState(0)
      const [introText, setIntroText] = useState('')
    
      const [isRecording, setIsRecording] = useState(false)
      const [recordingProgress, setRecordingProgress] = useState(0)
      const [recordedVideoUrl, setRecordedVideoUrl] = useState('')
    
      const recordRef = useRef(null)
    
      const handleQuizSubmit = (data) => {
        setQuizData(data)
        resetQuiz()
      }
    
      const resetQuiz = () => {
        setGameState(STATES.IDLE)
        setCurrentQuestion(-1)
        setShowAnswer(false)
        setTimer(0)
        setIntroText('')
      }
    
      const progressGame = () => {
        switch (gameState) {
          case STATES.IDLE:
            setGameState(STATES.READY)
            setIntroText('Ready')
            break
    
          case STATES.READY:
            setGameState(STATES.SET)
            setIntroText('Set')
            break
    
          case STATES.SET:
            setGameState(STATES.GO)
            setIntroText('Go!')
            break
    
          case STATES.GO:
            setGameState(STATES.QUESTION)
            setCurrentQuestion(0)
            setTimer(3)
            setIntroText('')
            break
    
          case STATES.QUESTION:
            if (timer > 1) {
              setTimer(timer - 1)
            } else {
              setGameState(STATES.ANSWER)
              setShowAnswer(true)
            }
            break
    
          case STATES.ANSWER:
            if (currentQuestion >= 7) {
              setGameState(STATES.OUTRO)
              setIntroText('Thanks for playing!\n\nSubscribe & Follow\nfor more awesome quizzes!')
            } else {
              setGameState(STATES.QUESTION)
              setCurrentQuestion(prev => prev + 1)
              setShowAnswer(false)
              setTimer(3)
            }
            break
    
          case STATES.OUTRO:
            // In this modified version, we keep the outro screen visible.
            break
        }
      }
    
      useEffect(() => {
        let timeoutId
    
        // Do not progress game automatically if in OUTRO state or when recording
        if (gameState !== STATES.IDLE && gameState !== STATES.OUTRO && !isRecording) {
          const delay = (() => {
            switch (gameState) {
              case STATES.READY:
              case STATES.SET:
              case STATES.GO:
                return 1000
              case STATES.QUESTION:
                return 1000
              case STATES.ANSWER:
                return 2000
              default:
                return 0
            }
          })()
    
          timeoutId = setTimeout(progressGame, delay)
        }
    
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
      }, [gameState, timer, currentQuestion, isRecording])
    
      const handlePlayPause = () => {
        if (gameState === STATES.IDLE || gameState === STATES.OUTRO) {
          resetQuiz()
          progressGame()
        } else {
          resetQuiz()
        }
      }
    
      async function recordQuiz() {
        if (!recordRef.current) {
          alert('No preview container to record.')
          return
        }
    
        const ffmpeg = createFFmpeg({ log: true })
        setIsRecording(true)
        setRecordingProgress(0)
        setRecordedVideoUrl('')
    
        // Load ffmpeg WebAssembly module
        await ffmpeg.load()
    
        // We record for a total of 50 seconds at 5 fps (250 frames)
        const durationSeconds = 50
        const fps = 5
        const totalFrames = durationSeconds * fps
        let capturedFrames = []
    
        for (let i = 0; i < totalFrames; i++) {
          // Capture a snapshot of the preview container using html2canvas
          const canvas = await html2canvas(recordRef.current)
          const dataUrl = canvas.toDataURL('image/png')
          // Convert data URL to Uint8Array using fetchFile helper
          const response = await fetch(dataUrl)
          const blob = await response.blob()
          const fileData = await fetchFile(blob)
          capturedFrames.push(fileData)
    
          setRecordingProgress(Math.floor(((i + 1) / totalFrames) * 100))
          // Wait for the next frame (1000 ms / fps)
          await new Promise(resolve => setTimeout(resolve, 1000 / fps))
        }
    
        // Write captured frames to ffmpeg FS with names img001.png, img002.png, ...
        for (let i = 0; i < capturedFrames.length; i++) {
          let filename = 'img' + String(i + 1).padStart(3, '0') + '.png'
          ffmpeg.FS('writeFile', filename, capturedFrames[i])
        }
    
        // Run ffmpeg command to convert images to mp4
        await ffmpeg.run('-framerate', String(fps), '-i', 'img%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4')
    
        // Read the output file
        const data = ffmpeg.FS('readFile', 'output.mp4')
        const videoBlob = new Blob([data.buffer], { type: 'video/mp4' })
        const videoUrl = URL.createObjectURL(videoBlob)
        setRecordedVideoUrl(videoUrl)
        setIsRecording(false)
      }
    
      return (
        <Container>
          <QuizForm onSubmit={handleQuizSubmit} />
          {quizData && (
            <PreviewSection>
              <div ref={recordRef}>
                <VideoPreview
                  quizData={quizData}
                  currentQuestion={currentQuestion}
                  showAnswer={showAnswer}
                  timer={timer}
                  introText={introText}
                />
              </div>
              <Button onClick={handlePlayPause}>
                {gameState === STATES.IDLE ? 'Play Quiz' : gameState === STATES.OUTRO ? 'Restart' : 'Stop'}
              </Button>
              <Button onClick={recordQuiz} disabled={isRecording || !quizData}>
                {isRecording ? 'Recording (' + recordingProgress + '%)' : 'Record Quiz'}
              </Button>
              {recordedVideoUrl && (
                <video width="540" height="960" controls>
                  <source src={recordedVideoUrl} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              )}
            </PreviewSection>
          )}
        </Container>
      )
    }
    
    export default App
