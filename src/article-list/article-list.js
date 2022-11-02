/* eslint-disable indent */
import React, { useEffect } from 'react'
import { Row, Col, Pagination, Alert, Spin } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { nanoid } from 'nanoid'

import Article from '../article'
import { clearSingle, getArticles, setCurrentPage } from '../store/articlesSlice'
import { falseRedirect } from '../store/userSlice'
import styleErrOnLoad from '../app/app.module.scss'

import styles from './article-list.module.scss'

export default function ArticleList() {
  const articles = useSelector((state) => state.articles)
  const user = useSelector((state) => state.user)
  const { listArticles } = articles
  const token = 'token' in user.user ? user.user.token : ''

  const dispatch = useDispatch()

  useEffect(() => {
    if (user.redirect) {
      dispatch(falseRedirect())
    }
  }, [user.redirect, dispatch])

  useEffect(() => {
    if (articles.singleArticle.status) dispatch(clearSingle())
    dispatch(getArticles({ offset: articles.offset, token }))
  }, [dispatch, articles.offset, token, articles.singleArticle.status])

  const articleElements = listArticles.array.length
    ? listArticles.array.map((item, index) => {
        if (index < 5) {
          return (
            <Col span={24} key={nanoid()}>
              <Article settings={item} />
            </Col>
          )
        }
        return null
      })
    : null

  const onClickPage = (currentPage) => {
    dispatch(setCurrentPage({ currentPage }))
  }

  const flagLoadOnErr =
    listArticles.error !== null ? (
      <Alert type="error" className={styleErrOnLoad.error} message={listArticles.error.message} />
    ) : null

  const articlesBlock = !listArticles.array.length ? (
    flagLoadOnErr
  ) : (
    <>
      <Row gutter={[16, 24]} className={styles['article-list']}>
        {articleElements}
      </Row>
      <Pagination
        className={styles['article-list__pagination']}
        total={articles.totalCount}
        current={articles.currentPage}
        pageSize={5}
        size="small"
        hideOnSinglePage
        showSizeChanger={false}
        onChange={onClickPage}
        type="primary"
      />
    </>
  )

  return articles.load ? <Spin size="large" className={styleErrOnLoad.spin} /> : articlesBlock
}
