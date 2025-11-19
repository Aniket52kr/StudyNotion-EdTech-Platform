import { useDispatch, useSelector } from "react-redux"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"

import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"

import { formatDate } from "../../../../services/formatDate"
import {
  deleteCourse,
  fetchInstructorCourses,
  getReviewsForCourse,
} from "../../../../services/operations/courseDetailsAPI"

import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseReviews, setCourseReviews] = useState([])

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId: courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) {
      setCourses(result)
    }
    setConfirmationModal(null)
    setLoading(false)
  }

  const handleViewCourseReviews = async (course) => {
    setSelectedCourse(course)
    const res = await getReviewsForCourse(course._id)
    setCourseReviews(res)
    setReviewsModalOpen(true)
  }

  return (
    <>
      <Table className="rounded-xl border border-richblack-800 ">
        <Thead className="text-richblack-100">
          <Tr className="flex gap-x-10 rounded-t-md border-b border-b-richblack-800 px-6 py-2">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100 ">
              Courses
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Duration
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Price
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Actions
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {courses?.length === 0 ? (
            <Tr>
              <Td className="py-10 text-center text-2xl font-medium text-richblack-100">
                No courses found
                {/* TODO: Need to change this state */}
              </Td>
            </Tr>
          ) : (
            courses?.map((course) => (
              <Tr
                key={course._id}
                className="flex gap-x-10 border-b border-richblack-800 px-6 py-8"
              >
                <Td className="flex flex-1 gap-x-4">
                  <img
                    src={course?.thumbnail}
                    alt={course?.courseName}
                    className="lg:h-[148px] lg:w-[220px] w-full aspect-video rounded-lg object-cover"
                  />
                  <div className="flex flex-col justify-between">
                    <p className=" max-sm:text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-richblack-5">
                      {course.courseName}
                    </p>

                    <p className="max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base text-richblack-300">
                      {course.courseDescription.split(" ").length >
                      TRUNCATE_LENGTH
                        ? course.courseDescription
                            .split(" ")
                            .slice(0, TRUNCATE_LENGTH)
                            .join(" ") + "..."
                        : course.courseDescription}
                    </p>

                    <p className="max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base text-white">
                      Created: {formatDate(course.createdAt)}
                    </p>

                    {course.status === COURSE_STATUS.DRAFT ? (
                      <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-pink-100">
                        <HiClock size={14} />
                        Drafted
                      </p>
                    ) : (
                      <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-yellow-100">
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
                          <FaCheck size={8} />
                        </div>
                        Published
                      </p>
                    )}
                  </div>
                </Td>

                <Td className="max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-richblack-100">
                  2hr 30min
                </Td>

                <Td className="max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-richblack-100">
                  ₹{course.price}
                </Td>

                <Td className="max-sm:text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-richblack-100 ">
                  <button
                    disabled={loading}
                    onClick={() => handleViewCourseReviews(course)}
                    title="View Reviews"
                    className="px-2 mr-1 transition-all duration-200 hover:scale-110 hover:text-yellow-25"
                  >
                    View Reviews
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => {
                      navigate(`/dashboard/edit-course/${course._id}`)
                    }}
                    title="Edit"
                    className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
                  >
                    <FiEdit2 className="max-sm:text-[13px] sm:text-xs md:text-sm lg:text-base" />
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Do you want to delete this course?",
                        text2:
                          "All the data related to this course will be deleted",
                        btn1Text: !loading ? "Delete" : "Loading...  ",
                        btn2Text: "Cancel",
                        btn1Handler: !loading
                          ? () => handleCourseDelete(course._id)
                          : () => {},
                        btn2Handler: !loading
                          ? () => setConfirmationModal(null)
                          : () => {},
                      })
                    }}
                    title="Delete"
                    className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                  >
                    <RiDeleteBin6Line className="max-sm:text-[13px] sm:text-xs md:text-sm lg:text-base" />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}

      {reviewsModalOpen && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
          <div className="w-11/12 max-w-[600px] rounded-lg bg-richblack-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-richblack-5">
                Reviews for {selectedCourse?.courseName}
              </h2>
              <button
                onClick={() => setReviewsModalOpen(false)}
                className="text-richblack-200"
              >
                ✕
              </button>
            </div>

            {courseReviews.length === 0 ? (
              <p className="text-sm text-richblack-200">
                No reviews yet for this course.
              </p>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {courseReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="rounded-md border border-richblack-600 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-richblack-5">
                        {rev.user?.firstName} {rev.user?.lastName}
                      </span>
                      <span className="text-xs text-yellow-25">
                        {rev.rating} ★
                      </span>
                    </div>
                    <p className="text-sm text-richblack-100">
                      {rev.review}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}