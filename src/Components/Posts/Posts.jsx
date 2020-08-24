import React, { useState, useEffect } from 'react';
import { Avatar } from '@material-ui/core';
import { db } from '../../api/firebase';
import styles from './Posts.module.css';
import { firestore } from 'firebase/app';

function Posts({ postId, user, username, imageUrl, caption }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().username,
              text: doc.data().text,
            }))
          );
        });
    }
    return () => {
      unsubscribe();
    };
  }, [postId]);

  const postComment = (e) => {
    e.preventDefault();
    console.log(postId);
    db.collection('posts').doc(postId).collection('comments').add({
      text: comment,
      username: user.displayName,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    setComment('');
  };

  return (
    <div className={styles.post}>
      <div className={styles.post__header}>
        <Avatar
          className={styles.post__avatar}
          alt={username}
          src="/static/images/Avatar/1.jpg"
        />
        <h3>{username}</h3>
      </div>
      <img className={styles.post__image} src={imageUrl} alt="" />
      <h4 className={styles.post__text}>
        <strong>{username}</strong> {caption}
      </h4>

      <div className={styles.post__comments}>
        {comments.map((comment) => (
          <p key={comment.id}>
            <strong>{comment.name}</strong> {comment.text}
          </p>
        ))}
      </div>

      {user ? (
        <form className={styles.post__commentBox}>
          <input
            className={styles.post__input}
            type="text"
            placeholder="Enter a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className={styles.post__button}
            disabled={!comment}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default Posts;
