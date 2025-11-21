import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

import { Autoplay, FreeMode, Pagination } from "swiper/modules"

import "../../App.css"
import { FaStar } from "react-icons/fa"

import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, [])

  return (
    <div className="text-white my-[50px] w-full ">
      <div className="mx-auto h-[180px]">
        <Swiper
          breakpoints={{
            // Mobile
            320: {
              slidesPerView: 1,
              spaceBetween: 50,
            },
            // Tablet
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // Desktop
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 1000,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="max-w-maxContentTab lg:max-w-maxContent h-full"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={i}>
              <div className="flex h-full flex-col justify-between gap-3 rounded-md bg-richblack-800 p-3 text-[14px] text-richblack-25">
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={
                      review?.user?.image
                        ? review?.user?.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                    }
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <h1 className="font-semibold text-richblack-5">
                      {`${review?.user?.firstName} ${review?.user?.lastName}`}
                    </h1>

                    {/* Optional: about/role line (e.g. "Full stack Development") */}
                    {review?.user?.additionalDetails?.about && (
                      <span className="text-[11px] text-richblack-400">
                        {review.user.additionalDetails.about}
                      </span>
                    )}

                    {/* Course name */}
                    <span className="text-[12px] font-medium text-richblack-200">
                      {review?.course?.courseName || "Course not available"}
                    </span>
                  </div>
                </div>

                <p className="text-center font-medium text-richblack-25">
                  {review?.review.split(" ").length > truncateWords
                    ? `${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ...`
                    : review?.review}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-semibold text-yellow-100">
                    {review.rating.toFixed(1)}
                  </h3>
                  <ReactStars
                    count={5}
                    value={review.rating}
                    size={20}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider