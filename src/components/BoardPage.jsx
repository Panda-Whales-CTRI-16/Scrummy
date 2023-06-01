import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import OnlineUsers from './OnlineUsers';
import CreateCard from './CreateCard';
import Column from './Column';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../userContext';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: flex-start;
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-family: 'Abril Fatface', cursive;
  font-size: 2.2rem;
`;

const SaveButton = styled.button`
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
  margin-top: 5px;
  &:hover:not([disabled]) {
    transform: translate(0px, 0px);
    box-shadow: 0px 0px;
  }
  &:disabled {
    cursor: not-allowed;
    background-color: #d1d5db;
  }
`;
const Board = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;
const HomeButton = styled.button`
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
  margin-top: 5px;
  &:hover:not([disabled]) {
    transform: translate(0px, 0px);
    box-shadow: 0px 0px;
  }
  &:disabled {
    cursor: not-allowed;
    background-color: #d1d5db;
  }
`;
const LogOutButton = styled.button`
  font-family: 'Abril Fatface', cursive;
  cursor: pointer;
  border: 1px solid black;
  font-size: 1.25rem;
  background-color: #a6faff;
  box-shadow: 2px 2px black;
  padding: 0.25rem 0.5rem;
  margin-top: 5px;
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

const HEADERS = ['To Do', 'In Progress', 'Complete', 'Reviewed'];

const BoardPage = () => {
  const navigate = useNavigate();
  const { userBoards, currBoard, setCurrBoard, currBoardID, boardName } =
    useContext(UserContext);
  // initial state of board will be result of get request.
  const [tasks, setTasks] = useState(currBoard);
  const [allUsers, setAllUsers] = useState({});
  const [user, setUser] = useState();

  // Wills 2am idea for storing state of board
  // currBoard is an object and will store tasks, allUsers, and user, as well as boardID and boardName
  // the default state of tasks, allUsers etc. will be set from the currBoard obj

  useEffect(() => {
    setCurrBoard(tasks);
    // console.log(currBoard);
  }, [tasks]);

  useEffect(() => {
    // get request the associated board id in the DB
    // pull the data on the storage property
    // a patch request is made to associated board to update storage when save board is pressed, or whenever the page is left/refreshed
    function onLoadTasks(tasks) {
      console.log('ON LOAD TASKS');
      console.log(tasks);
      setTasks(() => tasks);
    }

    function onUserConnected(usersObj) {
      setAllUsers(usersObj);
      setUser(usersObj[socket.id]);
    }

    function onUserDisconnected(socketId) {
      setAllUsers((allUsers) => {
        delete allUsers[socketId];
        return allUsers;
      });
    }

    function onAddTask(newTask) {
      setTasks((tasks) => {
        const newTasks = structuredClone(tasks);
        newTasks[0].push(newTask);
        return newTasks;
      });
    }

    function onDeleteTask(uuid) {
      setTasks((tasks) => {
        let newTasks = structuredClone(tasks);
        return newTasks.map((column) =>
          column.filter((task) => task.uuid !== uuid)
        );
      });
    }

    function onMoveTaskLeft(uuid) {
      setTasks((tasks) => {
        let newTasks = structuredClone(tasks);
        let foundTask = null;
        let foundColumnIndex;
        // find the task with the matching UUID and its current column index
        for (let i = 0; i < newTasks.length; i++) {
          // store current column
          const column = newTasks[i];
          // store index if uuid is found
          const taskIndex = column.findIndex((task) => task.uuid === uuid);

          // if match was found and in the last column (REVIEWED)...
          if (taskIndex !== -1 && i == newTasks.length - 1) {
            // remove the task at the specified index from the column array
            foundTask = column.splice(taskIndex, 1)[0];
            // delete the reviewer
            delete foundTask.reviewedBy;
            foundColumnIndex = i;
            break;
          }
          // if match was found and not in the first column...store result and column index
          else if (taskIndex !== -1 && i !== 0) {
            // remove the task at the specified index from the column array
            foundTask = column.splice(taskIndex, 1)[0];
            foundColumnIndex = i;
            break;
          }
        }
        if (foundTask !== null) {
          // push foundTask into previous column in storage
          newTasks[foundColumnIndex - 1].push(foundTask);
        }
        return newTasks;
      });
    }

    function onMoveTaskRight({ uuid, reviewerId }) {
      setTasks((tasks) => {
        let newTasks = structuredClone(tasks);
        let foundTask = null;
        let foundColumnIndex;
        // find the task with the matching UUID and its current column index
        for (let i = 0; i < newTasks.length; i++) {
          // store current column
          const column = newTasks[i];
          // store index if uuid is found
          const taskIndex = column.findIndex((task) => task.uuid === uuid);

          // if match was found and in the 2nd to last column (COMPLETE)...
          if (taskIndex !== -1 && i === newTasks.length - 2) {
            // remove the task at the specified index from the column array
            foundTask = column.splice(taskIndex, 1)[0];
            // create a current reviewer in storage
            console.log('##### REVIEWED BY ######');
            console.log(reviewerId);
            foundTask.reviewedBy = allUsers[reviewerId];
            foundColumnIndex = i;
            break;
          }
          // if match was found and not in the last column...
          else if (taskIndex !== -1 && i !== newTasks.length - 1) {
            // remove the task at the specified index from the column array
            foundTask = column.splice(taskIndex, 1)[0];
            foundColumnIndex = i;
            break;
          }
        }
        if (foundTask !== null) {
          // push foundTask into next column in storage
          newTasks[foundColumnIndex + 1].push(foundTask);
        }
        return newTasks;
      });
    }

    // Register event listeners
    socket.on('load-tasks', onLoadTasks);
    socket.on('user-connected', onUserConnected);
    socket.on('user-disconnected', onUserDisconnected);
    socket.on('add-task', onAddTask);
    socket.on('delete-task', onDeleteTask);
    socket.on('move-task-left', onMoveTaskLeft);
    socket.on('move-task-right', onMoveTaskRight);

    // Clean up the event listeners when the component unmounts
    // (prevents duplicate event registration)
    return () => {
      socket.off('load-tasks', onLoadTasks);
      socket.off('user-connected', onUserConnected);
      socket.off('user-disconnected', onUserDisconnected);
      socket.off('add-task', onAddTask);
      socket.off('delete-task', onDeleteTask);
      socket.off('move-task-left', onMoveTaskLeft);
      socket.off('move-task-right', onMoveTaskRight);
    };
  }, [allUsers]);

  function handleAddTask(content) {
    socket.emit('add-task', content);
  }

  function handleDeleteTask(uuid) {
    socket.emit('delete-task', uuid);
  }

  function handleMoveTaskLeft(uuid) {
    socket.emit('move-task-left', uuid);
  }

  function handleMoveTaskRight(uuid) {
    socket.emit('move-task-right', uuid);
  }

  //function to send put request on save
  async function save(e) {
    e.preventDefault();
    const saveData = {
      storage: currBoard,
    };
    try {
      const putURL = `/board?boardID=${currBoardID}`;
      const fetchResponse = await fetch(putURL, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });
      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        console.log('saved');
      }
    } catch (error) {
      console.log(error);
    }
  }

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

  const handleHome = () => {
    navigate('/home');
  };

  return (
    <main>
      <Header>
        <Container>
          <Title>{boardName}</Title>
          <CreateCard handleAddTask={handleAddTask} />
          <SaveButton onClick={save}>Save</SaveButton>
        </Container>
        <Container>
          <HomeButton onClick={handleHome}>Go to Home</HomeButton>
          <LogOutButton onClick={handleLogout}>Log out</LogOutButton>
          <OnlineUsers onlineUsers={Object.values(allUsers)} user={user} />
        </Container>
      </Header>
      <Board>
        {tasks.map((columnTasks, i) => (
          <Column
            key={`col_${i}`}
            header={HEADERS[i]}
            columnTasks={columnTasks}
            handleDeleteTask={handleDeleteTask}
            handleMoveTaskLeft={handleMoveTaskLeft}
            handleMoveTaskRight={handleMoveTaskRight}
            disableLeft={i === 0}
            disableRight={i === tasks.length - 1}
          />
        ))}
      </Board>
    </main>
  );
};

export default BoardPage;
