import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../userContext';


const gridAnimation = keyframes`
  0% { background-position:  100%; }
  100% {background-position: top }
`;
const SignupPage = styled.div`
  height: 100vh;
  width: 100%;
  display: grid;
  background-image: linear-gradient(#fea6f762 0.1em, transparent 0.1em),
    linear-gradient(90deg, #fea6f762 0.1em, transparent 0.1em);
  background-size: 0.7em 0.7em;
  animation-name: ${gridAnimation};
  animation-duration: 40s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
`;
const Error = styled.p`
    color: #ff0000a1;
    place-self: inherit;
`
const Form = styled.form`
  border: 2px solid black;
  background-color: white;
  box-shadow: 5px 5px black;
  gap: 0.75rem;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0.05) 0.1em,
      transparent 0.1em
    ),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0.1em, transparent 0.1em);
  background-size: 0.7em 0.7em;

  display: grid;
  padding: 2rem;

  place-self: center;
`;
const Title = styled.h1`
  text-align: center;
  font-size: 3rem;
  font-family: 'Abril Fatface', cursive;
  margin-bottom: 1rem;
`;
const Button = styled.button`
  font-family: 'Abril Fatface', cursive;
  cursor: pointer;
  border: 1px solid black;
  font-size: 1.25rem;
  background-color: #fea6f6;
  box-shadow: 2px 2px black;
  padding: 0.25rem 0.5rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
  transform: translate(-2px, -2px);
  &:hover:not([disabled]) {
    transform: translate(0px, 0px);
    box-shadow: 0px 0px;
  }
  &:disabled {
    cursor: not-allowed;
    background-color: #d1d5db;
  }
`;

const Input = styled.input`
  border: 1px solid black;
  border-radius: 2rem;
  color: black;
  font-size: 1.5rem;
  padding: 0.75rem 3rem 0.75rem 1.5rem;
`;
const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: .5fr ;
 align-items: center;
 justify-content: center;
`;

const Signup = () => {
const {setUsername, setUserBoards} = useContext(UserContext)
const [hasError,setHasError] = useState(false)
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const emailRef = useRef('')
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const loginUserData = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      email: emailRef.current.value
    };
    
  
    e.preventDefault();
    try {
      const postURL = '/auth/signup';
      const fetchResponse = await fetch(postURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginUserData),
      });
      const data = await fetchResponse.json();
    if(fetchResponse.ok) {
      navigate('/home');
      setUsername(loginUserData.username)
      setUserBoards([])
    }
    } catch (error) {
      // handle error
    setHasError(true)
      console.log(error);
      return {};
    }
  };
  return (
    <SignupPage>
      <Form onSubmit={handleSubmit}>
        <Title>Sign Up</Title>
        <Input
          name="username"
          ref={usernameRef}
          type="text"
          placeholder="username"
        ></Input>
        <Input
          name="password"
          ref={passwordRef}
          type="password"
          placeholder="password"
        ></Input>
        <Input
          name="email"
          ref={emailRef}
          type="text"
          placeholder="email"
        ></Input>
        {hasError && <Error> there was an error </Error>}
        <ButtonContainer>
          <Button type="submit" value="sign up">
            Lets Get Scrummin'!
          </Button>
        </ButtonContainer>
      </Form>
    </SignupPage>
  );
};

export default Signup;
