'use client'

import Form from 'next/form'
import { useState } from 'react'
type productsType = {
  _id?: string
  name: string
  price: number
  stock: number
  description: string
}

type dataResponse = {
  message: string
  products: productsType[]
}

const inputClassName = 'text-slate-800 text-left p-1 m-1'
const thClassName = 'px-2 py-1'

export default function Home() {
  const [productsState, setProductsState] = useState<productsType[]>([])

  const getProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/getProduct')
      const dataResponses = (await response.json()) as dataResponse
      setProductsState(dataResponses.products)
    } catch (err) {
      console.log({ err })
    }
  }

  const postProducts = async (product: productsType) => {
    try {
      await fetch('http://localhost:8080/createProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      console.log('front', { product })
    } catch (error) {
      console.log({ error })
    } finally {
      getProducts()
    }
  }

  return (
    <div className='flex justify-center justify-items-center p-2 pb-20 gap-8 sm:p-20 '>
      <Form
        action={(formData) => {
          const productData = {
            name: formData.get('productName') as string,
            price: parseInt(formData.get('productPrice') as string),
            stock: parseInt(formData.get('productStock') as string),
            description: formData.get('productDesc') as string,
          }
          postProducts(productData)
        }}
      >
        <div className='m-1 flex justify-between'>
          <div>
            <p className='text-4xl'>Product List</p>
            <p className='text-lg text-gray-400'>sorted by price</p>
          </div>
          <button
            className='flex font-medium rounded text-center p-2 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 h-fit'
            onClick={getProducts}
            type='button'
          >
            Get Products
          </button>
        </div>
        <table className='w-full text-sm text-right rtl:text-left text-gray-500 dark:text-gray-400'>
          <thead className='text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className={thClassName}>
                name
              </th>
              <th scope='col' className={thClassName}>
                price
              </th>
              <th scope='col' className={thClassName}>
                stock
              </th>
              <th scope='col' className={thClassName}>
                description
              </th>
            </tr>
          </thead>
          <tbody className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200'>
            {productsState?.length !== 0 ? (
              productsState?.map((product) => {
                return (
                  <tr key={product._id}>
                    <th scope='row' className='px-2 py-1 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                      {product.name}
                    </th>
                    <td className={thClassName}>{product.price}</td>
                    <td className={thClassName}>{product.stock}</td>
                    <td className={thClassName}>{product.description}</td>
                  </tr>
                )
              })
            ) : (
              <tr key={'empty'}>
                <th scope='row' className='px-2 py-1 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                  no data
                </th>
                <td className={thClassName}>no data</td>
                <td className={thClassName}>no data</td>
                <td className={thClassName}>no data</td>
              </tr>
            )}

            <tr>
              <td>
                <input name='productName' type='text' defaultValue={'new shirt'} className={inputClassName} />
              </td>
              <td>
                <input name='productPrice' type='number' defaultValue={199} className={inputClassName} />
              </td>
              <td>
                <input name='productStock' type='number' defaultValue={5000} className={inputClassName} />
              </td>
              <td>
                <div>
                  <input name='productDesc' type='text' defaultValue={''} className={inputClassName} />
                  <button className='shadow bg-purple-500 hover:bg-purple-400 font-bold p-1 mr-1 rounded text-white' type='submit'>
                    Add New Products
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Form>
    </div>
  )
}
