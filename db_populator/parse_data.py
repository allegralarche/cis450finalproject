import json

#script
raw_business_data = []

business_data_file = 'yelp_data/yelp_academic_dataset_business.json'

print 'Loading business data...'
with open(business_data_file) as f:
    for line in f:
        raw_business_data.append(json.loads(line))
        
print 'Constructing DB...'
business_data = []
category_data = []
offer_data = []

for business in raw_business_data:
    bid = business['business_id']
    d = {'business_id':bid, 'name':business['name'], 'rating':business['stars'], 'latitude':business['latitude'], 'longitude':business['longitude'], 'address':business['full_address']}
    business_data.append(d)
    
    categories = business['categories']
    for cat in categories:
        c = {'name':cat}
        if c not in category_data: category_data.append(c)
        
        offer_data.append({'business_id':bid, 'category_name':cat})
        
print len(category_data)
   
db = {}
db['Business'] = business_data
db['Category'] = category_data
db['Offers'] = offer_data   

json.dump(db['Business'], open('cleaned_data/businesses.json', 'w'))
json.dump(db['Category'], open('cleaned_data/categories.json', 'w'))
json.dump(db['Offers'], open('cleaned_data/offers.json', 'w'))
