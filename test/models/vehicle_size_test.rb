require 'test_helper'

class VehicleSizeTest < ActiveSupport::TestCase
  test "should require name" do
    vs = VehicleSize.new
    assert_not vs.save
  end
end
