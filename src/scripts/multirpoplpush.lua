local SOURCE = KEYS[1]
local DESTINATION = KEYS[2]
local COUNT = tonumber(ARGV[1])

if COUNT == 0 then return {} end

if COUNT == 1 then -- if there's only one, redis has a built-in command for this
  local key = redis.call('rpoplpush', SOURCE, DESTINATION)

  if key == nil then return {} end
  return {key}
end

local elems = {}
if COUNT < 0 then -- negative numbers mean we need to reverse direction
  for i = 1, COUNT * -1 do
    elems[i] = redis.call('lpop', DESTINATION)
    if elems[i] == nil then break end
  end

  if #elems > 0 then redis.call('rpush', SOURCE, unpack(elems)) end
else
  for i = 1, COUNT do
    elems[i] = redis.call('rpop', SOURCE)
    if elems[i] == nil then break end
  end

  if #elems > 0 then redis.call('lpush', DESTINATION, unpack(elems)) end
end

return elems