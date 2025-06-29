'use client'
import React, { useState } from 'react'
import { aRegister } from '@/actions/aRegister'
import GoogleSignInButton from './GoogleSignInButton'
import MyButton from '../ui/MyButton'
import { useForm } from 'react-hook-form'
import MyInput from '../ui/MyInput'
import Link from 'next/link'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { notify } from '@/hooks/useNotification'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type TRegister = {
  email: string
  password: string
  passwordConfirm: string
}


export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TRegister>()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: TRegister) => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await aRegister(formData)

    if (result.success) {
      notify.success(
        result.message,
        'Добро пожаловать в Habit Rabbit'
      )

      // Автоматический вход после регистрации
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false // Не делаем автоматический редирект
      })

      if (signInResult?.ok) {
        router.push('/profile')
      } else {
        router.push('/login?message=registration_success')
      }
    } else {
      notify.error(
        'Ошибка регистрации',
        result.message
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='min-w-80 md:min-w-[450px] flex flex-col gap-4 border border-gray-300 rounded-lg p-6 shadow-lg bg-white'>

      {/* Title */}
      <div className='w-3/4 mx-auto flex flex-col items-center'>
        <Link href='/' className='text-2xl font-bold text-center'>Habit Rabbit </Link>
        <p className='text-sm text-center text-gray-500'>Создайте аккаунт, чтобы начать использовать наш сервис</p>
      </div>

      {/* Email */}

      <MyInput
        type='email'
        label='Электронная почта'
        placeholder='Введите ваш email'
        {...register('email',
          {
            required: 'Email обязателен',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Неверный формат email'
            },
            validate: (value) => {
              const blockedDomains = ['@gmail.com', '@googlemail.com']
              const emailLower = value.toLowerCase()

              for (const domain of blockedDomains) {
                if (emailLower.includes(domain)) {
                  return 'Для Gmail используйте вход через Google'
                }
              }
              return true
            }
          })}
      />
      {errors.email && <p className='text-red-500 text-sm'>{errors.email.message as string}</p>}


      {/* Password */}
      <MyInput
        type={showPassword ? 'text' : 'password'}
        label='Пароль'
        placeholder='Введите пароль'
        rightIcon={
          showPassword ? (
            <FaEyeSlash
              size={18}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <FaEye
              size={18}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => setShowPassword(!showPassword)}
            />
          )
        }
        {...register('password',
          {
            required: 'Пароль обязателен',
            minLength: {
              value: 8,
              message: 'Пароль должен быть не менее 8 символов'
            }
          })}
      />
      {errors.password && <p className='text-red-500 text-sm'>{errors.password.message as string}</p>}


      {/* Password Confirmation */}

      <MyInput
        type={showPasswordConfirm ? 'text' : 'password'}
        label='Подтверждение пароля'
        placeholder='Повторите пароль'
        rightIcon={
          showPasswordConfirm ? (
            <FaEyeSlash
              size={18}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            />
          ) : (
            <FaEye
              size={18}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            />
          )
        }
        {...register('passwordConfirm',
          {
            required: 'Подтверждение пароля обязательно',
            validate: (value) => {
              if (value !== watch('password')) {
                return 'Пароли не совпадают'
              }
              return true
            }
          })}
      />
      {errors.passwordConfirm && <p className='text-red-500 text-sm'>{errors.passwordConfirm.message as string}</p>}


      {/* Register Button */}
      <MyButton type='submit' className='w-full mt-2'>Зарегистрироваться</MyButton>

      {/* Divider */}
      <div className='flex items-center'>
        <div className='flex-1 border-t border-gray-300'></div>
        <span className='px-4 text-sm text-gray-500'>или</span>
        <div className='flex-1 border-t border-gray-300'></div>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton />


      {/* Login Link */}
      <p className='text-sm text-center mt-4'>Уже есть аккаунт? <Link href='/login' className='text-blue-500 hover:text-blue-700 transition-colors'>Войти</Link></p>
    </form >
  )
}