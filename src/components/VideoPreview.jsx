import React, { useRef, useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'

const PreviewContainer = styled.div`
  width: 540px;
  height: 960px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
              url(${props => props.background});
  background-size: cover;
  background-position: center;
`

const Header = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 30px;
`

const Logo = styled.img`
  width: 180px;
  height: auto;
`

const TopicText = styled.div`
  color: white;
  font-size: 48px;
  text-shadow: 3px 3px 0 #000;
  text-align: right;
  max-width: 270px;
  line-height: 1.2;
`

const MainQuestion = styled.div`
  position: absolute;
  top: 210px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 48px;
  padding: 0 30px;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 4px 4px 0 #000,
               -2px -2px 0 #000,
               2px -2px 0 #000,
               -2px 2px 0 #000,
               2px 2px 0 #000;
`

const ContentArea = styled.div`
  position: absolute;
  top: ${props => props.topPosition}px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 30px;
  gap: 15px;
`

const QuestionContainer = styled.div`
  position: relative;
  width: 90%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(7px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.3);
`

const QuestionText = styled.div`
  text-align: center;
  color: black;
  font-size: 48px;
  text-shadow: 1px 1px 0 #fff;
  padding: 10px;
  line-height: 1.3;
  font-weight: bold;
`

const DifficultyBadge = styled.div`
  background-color: ${props => props.color};
  color: white;
  padding: 6px 22px;
  border-radius: 30px;
  font-size: 24px;
  text-shadow: 1px 1px 0 #000;
  margin-top: -8px;
  z-index: 1;
`

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const AnswerContainer = styled(QuestionContainer)`
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border: 3px solid #ffd700;
`

const AnswerText = styled(QuestionText)`
  color: #000;
  text-shadow: 1px 1px 0 #fff;
`

const TimerOrAnswer = styled.div`
  text-align: center;
  width: 90%;
  color: white;
  font-size: 144px;
  font-weight: bold;
  text-shadow: 4px 4px 0 #000;
  animation: ${pulse} 1s infinite;
`

const IntroText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 108px;
  text-align: center;
  text-shadow: 4px 4px 0 #000,
               -2px -2px 0 #000,
               2px -2px 0 #000,
               -2px 2px 0 #000,
               2px 2px 0 #000;
  white-space: pre-line;
  line-height: 1.2;
  
  &.outro {
    font-size: 54px;
  }
`

function VideoPreview({ quizData, currentQuestion, showAnswer, timer, introText }) {
  const [contentAreaTop, setContentAreaTop] = useState(330)
  const mainQuestionRef = useRef(null)

  useEffect(() => {
    if (mainQuestionRef.current) {
      const mainQuestionBottom = mainQuestionRef.current.getBoundingClientRect().bottom
      const newContentAreaTop = Math.max(330, mainQuestionBottom + 10)
      setContentAreaTop(newContentAreaTop)
    }
  }, [quizData.mainQuestion])

  const getDifficulty = (index) => {
    const difficulties = ['Simple', 'Medium', 'Expert', 'Genius']
    return difficulties[Math.floor(index/2)]
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Simple: '#4CAF50',
      Medium: '#FFC107',
      Expert: '#FF5722',
      Genius: '#9C27B0'
    }
    return colors[difficulty]
  }

  const isOutro = introText?.includes('Thanks')

  return (
    <PreviewContainer background={quizData.backgroundImage}>
      <Header>
        <Logo src="https://assets.zyrosite.com/m7V50XkBjEIo3pWx/quizillionnaire.com-logo-text-blank-_-large-YX4apgxwnwHwykjp.png" alt="QUIZILLIONNAIRE" />
        <TopicText>{quizData.topic}</TopicText>
      </Header>

      {!isOutro && <MainQuestion ref={mainQuestionRef}>{quizData.mainQuestion}</MainQuestion>}

      {introText && (
        <IntroText className={isOutro ? 'outro' : ''}>
          {introText}
        </IntroText>
      )}

      {!introText && currentQuestion >= 0 && (
        <ContentArea topPosition={contentAreaTop}>
          {!showAnswer && (
            <>
              <QuestionContainer>
                <QuestionText>
                  {quizData.questions[currentQuestion]}
                </QuestionText>
              </QuestionContainer>
              <DifficultyBadge color={getDifficultyColor(getDifficulty(currentQuestion))}>
                {getDifficulty(currentQuestion)}
              </DifficultyBadge>
              <TimerOrAnswer>{timer}</TimerOrAnswer>
            </>
          )}
          {showAnswer && (
            <AnswerContainer>
              <AnswerText>
                {quizData.answers[currentQuestion]}
              </AnswerText>
            </AnswerContainer>
          )}
        </ContentArea>
      )}
    </PreviewContainer>
  )
}

export default VideoPreview
