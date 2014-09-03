json.array!(@invitations) do |invitation|
  json.extract! invitation, :id, :name, :phone, :gift, :hotel, :party, :note
  json.url invitation_url(invitation, format: :json)
end
