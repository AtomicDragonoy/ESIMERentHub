import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const client = await clientPromise
    const db = client.db("ESIMERentHub")

    const { email, fullName, password, profilePicture, role } = req.body

    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.collection("users").insertOne({
      email,
      fullName,
      password: hashedPassword,
      profilePicture,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { 
        id: result.insertedId, 
        email, 
        fullName, 
        role 
      } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}