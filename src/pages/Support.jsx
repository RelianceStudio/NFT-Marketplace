import React from 'react'
import Footer from "../components/Footer"
import { Link } from "react-router-dom"

const Support = () => {
  return (
    <div className='min-h-screen overflow-hidden bg-[#0c0c0c] background'>
      <div className='mt-[120px] md:mt-[200px] flex flex-col md:ml-[40px] 3xl:ml-[120px] lg:max-w-[1200px]'>
        <div className='text-center md:w-[560px] px-4 md:px-0 md:mx-auto'>
          <p className='text-white text-[36px] md:text-[62px] font-gilroy font-semibold leading-[40px] md:leading-[65px]'>Contact us and we <br /> will help you</p>
          <div className='flex flex-col md:flex-row mt-[40px] md:mt-[60px] gap-2 lg:gap-4'>
            <input
              type="name"
              name="name"
              id="name"
              className="block w-full md:w-[260px] h-[56px] rounded-[10px] border-2 border-[#3b3c3c] bg-transparent text-[#828383] placeholder-[#828383] text-[16px] px-5 focus:outline-none focus:ring-0"
              placeholder="Name"
              aria-describedby="name-description"
            />
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full md:w-[285px] h-[56px] rounded-[10px] border-2 border-[#3b3c3c] bg-transparent text-[#828383] placeholder-[#828383] text-[16px] px-5 focus:outline-none focus:ring-0"
              placeholder="Email Address"
              aria-describedby="email-description"
            />
          </div>
          <div className='mt-[8px] md:mt-[16px]'>
            <input
              type="subject"
              name="subject"
              id="subject"
              className="block w-full md:w-[560px] h-[56px] rounded-[10px] border-2 border-[#3b3c3c] bg-transparent text-[#828383] placeholder-[#828383] text-[16px] px-5 focus:outline-none focus:ring-0"
              placeholder="Subject"
              aria-describedby="subject-description"
            />
          </div>
          <div className='mt-[8px] lg:mt-[16px]'>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="block w-full md:w-[560px] h-[168px] rounded-[10px] border-2 border-[#3b3c3c] bg-transparent text-[#828383] placeholder-[#828383] text-[16px] px-5 focus:outline-none focus:ring-0 py-[17px]"
              placeholder="Message"
              defaultValue={''}
            />
          </div>
          <div className='flex flex-col md:block mt-[30px] md:mt-[40px] gap-2 md:space-x-3'>
            <button className='md:w-[181px] h-[58px] rounded-[41px] text-black bg-[#beff55] text-center text-[18px] font-gilroy tracking-wide font-semibold'>
              Send Message
            </button>
            <button className='md:w-[179px] h-[58px] rounded-[41px] bg-transparent border-2 border-[#beff55] text-white text-[18px] font-gilroy tracking-wide'>
              <Link to="/" className='w-full h-[58px]'>
                Back To Home
              </Link>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Support;