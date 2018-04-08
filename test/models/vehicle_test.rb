require 'test_helper'

class VehicleTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test 'wont save without info' do 
      v = Vehicle.new
    assert_not v.save
  end
  test 'wont save without one field' do 
    v = Vehicle.new(make: 'toyota', model: 'corolla', year: '1999', vehicle_size: VehicleSize.first)
    p v
    assert_not v.save
  end
  test 'wont save without one field' do 
    v = Vehicle.new(make: 'toyota', model: 'corolla', year: '1999', vehicle_size: VehicleSize.first)
    p v
    assert_not v.save
  end
end
