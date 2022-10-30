import React, { useEffect } from 'react'
import { Button, Checkbox, Divider, Alert, Spin } from 'antd'
import { useForm } from 'react-hook-form'
import { Link, Redirect } from 'react-router-dom'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { delError, loginRegUser } from '../store/userSlice'
import styleErrOnLoad from '../app/app.module.scss'

import styles from './profile.module.scss'

export default function Profile({ status }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm({
    mode: 'onChange',
  })

  const user = useSelector((state) => state.user)

  const dispatch = useDispatch()

  useEffect(() => {
    clearErrors()
    dispatch(delError('all'))
    reset()
  }, [status, clearErrors, dispatch, reset])

  const onSubmit = (data) => {
    dispatch(delError('all'))
    if (status === 'register') data.status = 'register'
    if (status === 'login') data.status = 'login'
    if (status === 'edit') {
      data.status = 'edit'
      data.token = user.user.token
    }
    dispatch(loginRegUser(data))
  }

  const footerRegister = (
    <>
      Already have an account? <Link to="/sign-in">Sign In. </Link>
    </>
  )

  const footerLogin = (
    <>
      Don’t have an account? <Link to="/sign-up">Sign Up </Link>
    </>
  )

  const textBtnSub = status === 'register' ? 'Create' : status === 'login' ? 'Login' : 'Save'
  const header = status === 'register' ? 'Create new account' : status === 'login' ? 'Sign In' : 'Edit Profile'

  if ((status === 'edit' && !user.authorization) || (status !== 'edit' && user.authorization)) {
    return <Redirect to="/articles" />
  }

  if (!user.redirect || ((status === 'register' || status === 'login') && !user.authorization)) {
    return (
      <form className={styles['login-form']} onSubmit={handleSubmit(onSubmit)}>
        <h1 className={styles['sign-title']}>{header}</h1>

        {'email or password' in user.error && status === 'login' ? (
          <Alert type="error" className={styleErrOnLoad.error} message="Incorrect login or password" />
        ) : null}

        {'error' in user.error ? (
          <Alert
            type="error"
            className={styleErrOnLoad.error}
            message={`Error: ${user.error.error.status} ${user.error.message}. Try later`}
          />
        ) : null}

        {user.load ? <Spin size="large" className={styleErrOnLoad.spin} /> : null}

        {status === 'register' || status === 'edit' ? (
          <>
            <p className={styles['sign-form-prefix']}>Username</p>
            <input
              {...register('username', {
                required: 'Please input your username!',
                validate: () => {
                  if ('username' in user.error) dispatch(delError('username'))
                },
                minLength: {
                  value: 3,
                  message: 'Your username needs to be at least 3 characters.',
                },
                maxLength: {
                  value: 20,
                  message: 'Your username needs to be no more than 20 characters.',
                },
              })}
              className={classNames('ant-input', { 'input-red': errors.username || 'username' in user.error })}
              placeholder="Username"
              type="text"
              defaultValue={status === 'edit' ? user.user.username : ''}
              autoFocus={status === 'register' || status === 'edit'}
            />
            {errors.username && <p className={styles['input-error']}>{errors.username.message}</p>}
            {'username' in user.error && !errors.username && (
              <p className={styles['input-error']}>This name is already use</p>
            )}
          </>
        ) : null}

        <p className={styles['sign-form-prefix']}>Email address</p>
        <input
          {...register('email', {
            required: 'Please input your E-mail!',
            pattern: {
              value: /^[^A-Z]+([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/,
              message: 'Please enter valid email!',
            },
            validate: () => {
              if ('email' in user.error) dispatch(delError('email'))
            },
          })}
          className={classNames('ant-input', { 'input-red': errors.email || 'email' in user.error })}
          placeholder="Email address"
          type="text"
          defaultValue={status === 'edit' ? user.user.email : ''}
          autoFocus={status === 'login'}
        />
        {errors.email && <p className={styles['input-error']}>{errors.email.message}</p>}
        {'email' in user.error && !errors.email && <p className={styles['input-error']}>This email is already use</p>}

        <p className={styles['sign-form-prefix']}>{status === 'edit' ? 'New password' : 'Password'}</p>
        <input
          className={classNames('ant-input', {
            'input-red': errors.password,
          })}
          {...register('password', {
            required: 'Please input your password!',
            minLength: {
              value: status === 'login' ? null : 6,
              message: 'Your username needs to be at least 6 characters.',
            },
            maxLength: {
              value: status === 'login' ? null : 40,
              message: 'Your username needs to be no more than 40 characters.',
            },
          })}
          placeholder={status === 'edit' ? 'New password' : 'Password'}
          defaultValue={status === 'edit' ? JSON.parse(localStorage.getItem('user')).password : null}
          type="password"
        />
        {errors.password && <p className={styles['input-error']}>{errors.password.message}</p>}

        {status === 'register' ? (
          <>
            <p className={styles['sign-form-prefix']}>Repeat Password</p>
            <input
              className={classNames('ant-input', { 'input-red': errors['password-repeat'] })}
              {...register('password-repeat', {
                required: 'Please repeat your password!',
                validate: (value) => value === getValues('password') || 'Passwords must match',
              })}
              placeholder="Repeat password"
              type="password"
            />
            {errors['password-repeat'] && <p className={styles['input-error']}>{errors['password-repeat'].message}</p>}
          </>
        ) : null}

        {status === 'edit' ? (
          <>
            <p className={styles['sign-form-prefix']}>Avatar image (url)</p>
            <input
              className={classNames('ant-input', { 'input-red': errors.image })}
              {...register('image', {
                pattern: {
                  value:
                    /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\\/])*)?/,
                  message: 'Incorrect url address',
                },
              })}
              placeholder="Avatar image"
              type="url"
              defaultValue={user.user.image}
            />
            {errors.image && <p className={styles['input-error']}>{errors.image.message}</p>}
          </>
        ) : null}

        {status === 'register' ? (
          <>
            <Divider style={{ margin: '20px 0 5px' }} />

            <Checkbox className={styles['input-checkbox']} required defaultChecked>
              I agree to the processing of my personal information
            </Checkbox>
          </>
        ) : null}

        <Button type="primary" htmlType="submit" className={styles['login-form-button']}>
          {textBtnSub}
        </Button>

        {status === 'register' || status === 'login' ? (
          <p className={styles['sign-footer']}>{status === 'register' ? footerRegister : footerLogin}</p>
        ) : null}
      </form>
    )
  }

  return <Redirect to="/articles" />
}
