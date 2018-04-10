class Review < ApplicationRecord
  belongs_to :vehicle
  validates :rating, presence: true, inclusion: {in: 1..5}
  validates :vehicle_id, presence: true
  validates :email, presence: true, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i, on: :create }

  def current_users? (email)
    if email == self.email
      return true
    else
      return false
    end
  end
end
