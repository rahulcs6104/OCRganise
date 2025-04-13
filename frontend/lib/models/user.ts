import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  items?: any[]
  tax?: number
  total?: number
  categories?: string[]
  friends?: Array<{ name: string; amount: number }>
}

export interface SafeUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
  categories?: string[]
  friends?: Array<{ name: string; amount: number }>
}

export function sanitizeUser(user: User): SafeUser {
  return {
    _id: user._id?.toString() || "",
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    categories: user.categories,
    friends: user.friends,
  }
}
