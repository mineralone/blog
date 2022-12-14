import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Spin, Alert } from 'antd'

import { getSingleArticle } from '../store/articlesSlice'
import Article from '../article/article'
import styleErrOnLoad from '../app/app.module.scss'

export default function ArticlePage({ slug }) {
  const dispatch = useDispatch()
  const articles = useSelector((state) => state.articles)
  const singleArticle = useSelector((state) => state.articles.singleArticle)
  const user = useSelector((state) => state.user)
  const token = 'token' in user.user ? user.user.token : ''

  useEffect(() => {
    dispatch(getSingleArticle({ slug, token }))
  }, [dispatch, slug, token])

  const flagLoadOnErr =
    singleArticle.error !== null ? (
      <Alert type="error" className={styleErrOnLoad.error} message={singleArticle.error.message} />
    ) : null

  const article = singleArticle.object === null ? flagLoadOnErr : <Article settings={singleArticle.object} />

  return articles.load ? <Spin size="large" className={styleErrOnLoad.spin} /> : article
}
