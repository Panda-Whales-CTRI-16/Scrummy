import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UserBoards from './UserBoards';
import styled from 'styled-components';
import { UserContext } from '../userContext';

const Page = styled.div`
  font-family: 'Abril Fatface', cursive;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* align-items: center; */
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
`;

const Li = styled.li`
  list-style-type: none;
  font-size: 1.5rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding: 10px 10px;
  background-color: #ffffff;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0.05) 0.1em,
      transparent 0.1em
    ),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0.1em, transparent 0.1em);
  background-size: 0.7em 0.7em;
  border-bottom: 2px solid black;
`;

const Button = styled.button`
  font-family: 'Abril Fatface', cursive;
  cursor: pointer;
  border: 1px solid black;
  font-size: 1.25rem;
  background-color: #a6faff;
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

const HomePage = () => {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();
  const handleLogout = async () => {
    console.log('Logout Clicked!');
    try {
      const logout = await fetch('/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Page>
      <Header>
        <Li>{username}</Li>
        <Button onClick={handleLogout}>Log out</Button>
      </Header>
      <UserBoards />
    </Page>
  );
};

export default HomePage;
