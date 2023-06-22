class AddSchoolColumnToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :school, :string
  end
end
