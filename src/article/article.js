import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, Avatar, Typography, Tag, message, Popconfirm, Alert } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { nanoid } from 'nanoid'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { Link, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import classNames from 'classnames'

import { deleteArticle, favoriteArticle } from '../API'
import styleErrOnLoad from '../app/app.module.scss'

import styles from './article.module.scss'

const { Meta } = Card
const { Title, Text } = Typography

function Article({ settings }) {
  const singleStatus = useSelector((state) => state.articles.singleArticle.status)
  const user = useSelector((state) => state.user.user)
  const { title, author, description, tagList, updatedAt, favorited, favoritesCount, slug, body } = settings
  const time = format(parseISO(updatedAt), 'MMMM d, y')

  const [like, setLike] = useState({ like: favorited, count: favoritesCount })

  const [statusDel, setStatusDel] = useState('')

  const tags = tagList.map((item, index) => {
    if (!item || item === null || index > 8) return null
    const id = nanoid()
    return <Tag key={id}>{item}</Tag>
  })

  const confirm = async () => {
    message.success('Article is deleted...')
    try {
      await deleteArticle(slug, user.token)
      setStatusDel('complete')
    } catch (e) {
      setStatusDel('error')
    }
  }

  useEffect(() => {}, [favorited, favoritesCount])
  const cancel = () => {
    message.error('You canceled the deletion of the article')
  }

  const goLike = async (status) => {
    if ('token' in user) {
      try {
        await favoriteArticle(slug, user.token, status)
        setLike(({ count }) => ({ like: status, count: status ? count + 1 : count - 1 }))
      } catch (e) {
        message.error(e.message)
      }
    } else {
      message.error('Authorisation Error. Login required.')
    }
  }

  if (statusDel === 'complete') return <Redirect to="/articles" />

  return (
    <Card className={classNames(styles.article, { [`${styles.article_single}`]: singleStatus })}>
      <div className={styles.article__content}>
        <Title level={4} className={styles.article__title}>
          <Link to={`/articles/${slug}`} className={styles.article__link}>
            {title}
          </Link>
          {!like.like ? (
            <HeartOutlined onClick={() => goLike(true)} />
          ) : (
            <HeartFilled onClick={() => goLike(false)} style={{ color: '#FF0707' }} />
          )}{' '}
          <Text>{like.count}</Text>
        </Title>
        <div className={styles.article__tags}>{tags}</div>
        <Text>{description}</Text>
        {singleStatus && user.username === author.username ? (
          <div className={styles['article-edit']}>
            <Popconfirm
              title="Are you sure to delete this article?"
              onConfirm={confirm}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <button
                className={classNames(styles['article-edit__action'], styles['article-edit__action_btn'])}
                type="button"
              >
                Delete
              </button>
            </Popconfirm>
            <Link
              className={classNames(styles['article-edit__action'], styles['article-edit__action_link'])}
              to={`/articles/${slug}/edit`}
            >
              Edit
            </Link>
          </div>
        ) : null}
      </div>
      <Meta
        avatar={<Avatar size={46} src={author.image} />}
        title={author.username}
        description={time}
        className={styles.article__user}
      />
      {singleStatus && statusDel === 'error' ? (
        <Alert
          type="error"
          className={classNames(styleErrOnLoad.error, styles['error-del'])}
          message="Failed to delete article. Try later"
        />
      ) : null}
      {singleStatus ? (
        <div className={styles.article__body}>
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      ) : null}
    </Card>
  )
}

export default Article
