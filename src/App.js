import React, { useState, useEffect } from 'react';
import { Modal, makeStyles, Button, TextField } from '@material-ui/core';
import { Posts, ImgUpload } from './Components';
import { db, auth } from './api/firebase';
import './App.css';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, SetUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        SetUser(authUser);
      } else {
        SetUser(null);
      }
    });

    return () => {
      // perfom cleanup actions
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const signUp = (event) => {
    event.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));
    setOpen(false);
  };

  const signIn = (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));
    setOpenSignIn(false);
  };

  const login = (
    <div style={modalStyle} className={classes.paper}>
      <center>
        <img
          src="https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png"
          alt="logo"
        />
      </center>
      <form className="app__signup">
        <TextField
          label="E-Mail"
          margin="dense"
          type="text"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          margin="dense"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" onClick={signIn}>
          Login
        </Button>
      </form>
    </div>
  );

  const register = (
    <div style={modalStyle} className={classes.paper}>
      <center>
        <img
          src="https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png"
          alt="logo"
        />
      </center>
      <form className="app__signup">
        <TextField
          label="E-Mail"
          margin="dense"
          type="text"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Username"
          margin="dense"
          type="text"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          margin="dense"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" onClick={signUp}>
          Create Account
        </Button>
      </form>
    </div>
  );

  return (
    <div className="App">
      <div className="app__header">
        <h2 className="app__headerImage">Marcel Schmager</h2>
        {user ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>Sign in</Button>
            <Button onClick={() => setOpen(true)}>Sign up</Button>
          </div>
        )}
      </div>
      <div className="app__posts">
        {posts.map(({ id, post }) => (
          <Posts
            key={id}
            postId={id}
            user={user}
            username={post.username}
            imageUrl={post.imageUrl}
            caption={post.caption}
          />
        ))}
      </div>

      {user?.displayName ? <ImgUpload username={user.displayName} /> : null}

      <Modal open={open} onClose={() => setOpen(false)}>
        {register}
      </Modal>

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        {login}
      </Modal>
    </div>
  );
}

export default App;
