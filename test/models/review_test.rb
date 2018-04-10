require 'test_helper'

class ReviewTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  review_info = {
    rating: 3.5,
    comment: 'decent car',
    email: 'jon.bent@me.com',
  }
  vehicle_reviews = Vehicle.includes(:reviews).where.not(reviews: {id: nil}).first.reviews
  test_review = vehicle_reviews.first

  test 'wont save without info' do 
    r = Review.new
    assert_not r.save
  end
  test 'wont save without rating' do 
    r = vehicle_reviews.new(review_info)
    r.rating = nil
    assert_not r.save
  end
  test 'wont save with rating over 5' do 
    r = vehicle_reviews.new(review_info)
    r.rating = 5.1
    assert_not r.save
  end
  test 'wont save without vehicle' do 
    r = Review.new(review_info)
    assert_not r.save
  end
  test 'wont save without email' do 
    r = vehicle_reviews.new(review_info)
    r.email = nil
    assert_not r.save
  end
  test 'wont save with broken email' do 
    r = vehicle_reviews.new(review_info)
    r.email = 'fdsafdsafsdafasd'
    assert_not r.save
  end
  test 'will save without comment' do 
    r = vehicle_reviews.new(review_info)
    r.comment = nil
    assert r.save
  end
  test 'will save with info' do 
    r = vehicle_reviews.new(review_info)
    assert r.save
  end
  test "will find if user's email is the same as the review" do
    assert test_review.current_users?(test_review.email)
  end
end
