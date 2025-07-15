import { resolve } from 'path'
import axios from '../helpers/axios'
import { rejects } from 'assert'

export const fetchDashboardSummary = async (config: any): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get('/api/dashboard/summary-list', config)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}

export const fetchDashboardDetail = async (id: any): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get(`/api/dashboard/detail/${id}`)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}

export const fetchProductsDetail = async (config: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get('/api/products', config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}