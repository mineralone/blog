import React, { useEffect, useState } from 'react'
import { Button, Alert, Spin } from 'antd'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { createNewArticle, editArticle } from '../API'
import stylesSign from '../profile/profile.module.scss'
import styleErrOnLoad from '../app/app.module.scss'
import { getSingleArticle, clearSingle } from '../store/articlesSlice'

import styles from './article-form.module.scss'

export default function ArticleForm({ status = 'new', slug }) {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
  })

  const articles = useSelector((state) => state.articles)

  const { singleArticle: article } = articles

  const dispatch = useDispatch()

  const [tags, setTags] = useState([{ value: '', id: nanoid() }])
  const [errTags, setErr] = useState({})
  const [condition, setCondition] = useState({
    load: false,
    error: null,
    completed: false,
    slug: slug || '',
  })

  const user = useSelector((state) => state.user)

  useEffect(() => {
    clearErrors()
    reset()
    if (status === 'edit') {
      dispatch(getSingleArticle({ slug, token: user.user.token }))
    }
    return () => dispatch(clearSingle())
  }, [status, clearErrors, reset, dispatch, slug, user])

  useEffect(() => {
    if (status === 'edit') {
      setTags((array) => {
        if (article.object !== null && 'tagList' in article.object) {
          const list = article.object.tagList
          return list.length > 0 ? list.map((item) => ({ value: item, id: nanoid() })) : array
        }
        return array
      })
    }
  }, [setTags, article.object, status])

  useEffect(() => {
    setCondition((prev) => ({ ...prev, load: articles.load }))
  }, [articles.load])

  const onSubmit = async (data) => {
    const tagList = tags.filter((item) => item.value)
    if (tagList.length) data.tagList = tagList.map((item) => item.value)
    setCondition({ load: true, error: null, completed: false })
    try {
      const response =
        status === 'new'
          ? await createNewArticle(data, user.user.token)
          : await editArticle(data, slug, user.user.token)
      setCondition({ load: false, completed: true, error: null, slug: response.article.slug })
    } catch (e) {
      setCondition({ load: false, completed: false, error: e.message })
    }
  }

  const tagSub = (e) => {
    e.preventDefault()
    if (e.target[0].value && tags[tags.length - 1].value) {
      setTags((array) => [...array, { value: '', id: nanoid() }])
      setErr({})
    } else {
      setErr({ error: 'You cannot add an empty tag' })
    }
  }

  const changeTags = (e, id) => {
    setTags((array) => {
      return array.map((item) => {
        if (item.id === id) item.value = e.target.value
        return item
      })
    })
    if (!e.target.value && tags.length > 1) deleteTag(id)
    setErr({})
  }

  const deleteTag = (id) => {
    if (tags.length > 1) {
      setTags((array) => {
        return array.filter((item) => item.id !== id)
      })
      setErr({})
    } else {
      setErr({ error: 'You cannot delete a single element' })
    }
  }
  if (status === 'edit' && article.object !== null && user.user.username !== article.object.author.username) {
    return <Redirect to={`/articles/${slug}`} />
  }

  if (!user.authorization && !localStorage.getItem('user')) return <Redirect to={`/articles/${slug}`} />

  const inputTags = tags.map((item, index) => {
    return (
      <span key={item.id}>
        <form onSubmit={index === tags.length - 1 ? tagSub : (e) => e.preventDefault()} className={styles.tags}>
          <input
            onChange={(e) => changeTags(e, item.id)}
            className={classNames('ant-input', styles['tags-input'], {
              'input-red': errTags.error && index === tags.length - 1,
            })}
            defaultValue={item.value}
            placeholder="Tag"
            autoFocus={index === tags.length - 1 && tags.length > 1}
            disabled={condition.load}
          />
          <button
            type="button"
            onClick={() => deleteTag(item.id)}
            className={classNames(styles['tags-btn-delete'], styles['tags-btn'])}
            disabled={condition.load}
          >
            Delete
          </button>
          {index === tags.length - 1 ? (
            <button
              type="submit"
              className={classNames(styles['tags-btn-add'], styles['tags-btn'])}
              disabled={condition.load}
            >
              Add tag
            </button>
          ) : null}
        </form>
        {errTags.error && index === tags.length - 1 && <p className={stylesSign['input-error']}>{errTags.error}</p>}
      </span>
    )
  })

  if (!condition.completed && (status === 'new' || (status === 'edit' && !article.load))) {
    return (
      <div className={classNames(stylesSign['login-form'], styles['article-form'])}>
        <form id="article" onSubmit={handleSubmit(onSubmit)}>
          <h1 className={stylesSign['sign-title']}>{status === 'new' ? 'Create new article' : 'Edit article'}</h1>

          {condition.error !== null ? (
            <Alert type="error" className={styleErrOnLoad.error} message={`${condition.error}`} />
          ) : null}

          {condition.load ? <Spin size="large" className={styleErrOnLoad.spin} /> : null}

          <p className={classNames(stylesSign['sign-form-prefix'], styles['input-form-article-prefix'])}>Title</p>
          <input
            {...register('title', {
              required: 'Article title must not be empty',
            })}
            className={classNames('ant-input', { 'input-red': errors.title })}
            placeholder="Title"
            type="text"
            autoFocus
            defaultValue={status === 'edit' && article.object !== null ? article.object.title : ''}
            disabled={condition.load}
          />
          {errors.title && <p className={stylesSign['input-error']}>{errors.title.message}</p>}

          <p className={stylesSign['sign-form-prefix']}>Short description</p>
          <input
            {...register('description', {
              required: 'Please fill in the description of the article',
            })}
            className={classNames('ant-input', { 'input-red': errors.description })}
            placeholder="Title"
            type="text"
            defaultValue={status === 'edit' && article.object !== null ? article.object.description : ''}
            disabled={condition.load}
          />
          {errors.description && <p className={stylesSign['input-error']}>{errors.description.message}</p>}

          <p className={stylesSign['sign-form-prefix']}>Text</p>
          <textarea
            {...register('body', {
              required: 'Your article cannot be empty',
            })}
            className={classNames('ant-input', styles['text-area'], { 'input-red': errors.body })}
            placeholder="Text"
            defaultValue={status === 'edit' && article.object !== null ? article.object.body : ''}
            disabled={condition.load}
          />
          {errors.body && <p className={stylesSign['input-error']}>{errors.body.message}</p>}
        </form>

        <p className={stylesSign['sign-form-prefix']}>Tags</p>
        {inputTags}

        <Button
          type="primary"
          htmlType="submit"
          form="article"
          className={classNames(stylesSign['login-form-button'], styles['article-form-send'])}
          disabled={condition.load}
        >
          Send
        </Button>
      </div>
    )
  }

  if (status === 'edit' && article.load) {
    return <Spin size="large" className={styleErrOnLoad.spin} />
  }

  if (status === 'edit' && article.error !== null) {
    return <Alert type="error" className={styleErrOnLoad.error} message={article.error.message} />
  }

  return <Redirect to={`/articles/${condition.slug}`} />
}
