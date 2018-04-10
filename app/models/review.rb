class Review < ApplicationRecord
  belongs_to :vehicle
  validates :rating, presence: true
  validates :vehicle_id, presence: true

  def current_users? (email)
    if email == self.email
      return true
    else
      return false
    end
  end
end
