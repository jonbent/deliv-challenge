class Review < ApplicationRecord
  belongs_to :vehicle
  validates :rating, presence: true
  validates :vehicle_id, presence: true
end
