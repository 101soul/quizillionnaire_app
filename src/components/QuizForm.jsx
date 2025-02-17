import React, { useState } from 'react'
import styled from 'styled-components'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 4px;
  min-height: 400px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
`

const Button = styled.button`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Copperplate Gothic Bold', sans-serif;
  
  &:hover {
    opacity: 0.9;
  }
`

const InfoText = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const QuizForm = ({ onSubmit }) => {
  const [rawInput, setRawInput] = useState('')

  const parseQuizData = (text) => {
    const lines = text.trim().split('\n')
    
    // Need at least 11 lines (image, topic, main question, and 8 QA pairs)
    if (lines.length < 11) {
      throw new Error('Please provide all required information')
    }

    const imageUrl = lines[0].trim()
    const topic = lines[1].trim()
    const mainQuestion = lines[2].trim()

    const qaLines = lines.slice(3)
    const questions = []
    const answers = []

    qaLines.forEach(line => {
      const [question, answer] = line.split('|').map(s => s.trim())
      if (question && answer) {
        questions.push(question)
        answers.push(answer)
      }
    })

    if (questions.length !== 8 || answers.length !== 8) {
      throw new Error('Please provide exactly 8 question-answer pairs')
    }

    return {
      backgroundImage: imageUrl,
      topic,
      mainQuestion,
      questions,
      answers
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const quizData = parseQuizData(rawInput)
      onSubmit(quizData)
    } catch (error) {
      alert(error.message)
    }
  }

  const sampleFormat = `https://example.com/image.jpg
Famous Cities
Can you name the city?
Home to the Eiffel Tower. "City of Love." | Paris
Bright lights, Broadway, Times Square. | New York City
[... 6 more question|answer pairs ...]`

  return (
    <Form onSubmit={handleSubmit}>
      <InfoText>
        Paste your quiz content in this format:
        <pre>
          {sampleFormat}
        </pre>
      </InfoText>
      <TextArea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Paste your quiz content here..."
        required
      />
      <Button type="submit">Generate Preview</Button>
    </Form>
  )
}

export default QuizForm
