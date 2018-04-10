require 'test_helper'

class VehicleTest < ActiveSupport::TestCase
  car_info = {
    make: 'Toyota',
    model: 'Corollla',
    year: 1999,
    vehicle_size: VehicleSize.first,
    color: 'red',
    vin: '1FTSX2B54AE106428',
    trim: 'XE',
  }
  test 'wont save without info' do 
    v = Vehicle.new
    assert_not v.save
  end
  test 'wont save without make' do 
    v = Vehicle.new(car_info)
    v.make = nil
    assert_not v.save
  end
  test 'wont save without model' do 
    v = Vehicle.new(car_info)
    v.model = nil
    assert_not v.save
  end
  test 'wont save without year' do 
    v = Vehicle.new(car_info)
    v.year = nil
    assert_not v.save
  end
  test 'wont save without size' do 
    v = Vehicle.new(car_info)
    v.vehicle_size = nil
    assert_not v.save
  end
  test 'wont save without color' do 
    v = Vehicle.new(car_info)
    v.color = nil
    assert_not v.save
  end
  test 'wont save without vin' do 
    v = Vehicle.new(car_info)
    v.vin = nil
    assert_not v.save
  end
  test 'will save with all info' do 
    v = Vehicle.new(car_info)
    assert v.save
  end

end
